from flask import Flask, render_template, Response, request, jsonify
from flask_cors import CORS
from ultralytics import YOLO
import cv2
import numpy as np
import threading
import time
from pathlib import Path
import threading
import os
from time import perf_counter
try:
    import psutil  # Optional; used for /metrics if available
except Exception:  # pragma: no cover
    psutil = None
try:
    import torch  # Optional; used to control thread counts/device if available
except Exception:  # pragma: no cover
    torch = None

app = Flask(__name__)
CORS(app)  # Enable CORS for Vue.js frontend

# Base directories
BASE_DIR = Path(__file__).resolve().parent
DEFAULT_ASSET_DIR = BASE_DIR / "MORN_CITY"
TEMPLATE_DIR = BASE_DIR / "PASAR" / "templates"

# Ensure Flask knows where templates live (reuse PASAR templates)
app.template_folder = str(TEMPLATE_DIR)

# Performance/config knobs (env-configurable)
def _get_int_env(name: str, default: int) -> int:
    try:
        return int(os.environ.get(name, str(default)))
    except Exception:
        return default

TARGET_FPS = _get_int_env('AIC_FPS', 25)
JPEG_QUALITY = _get_int_env('AIC_JPEG_QUALITY', 85)
# Resize frames before inference/stream; 0 disables resizing
FRAME_RESIZE_WIDTH = _get_int_env('AIC_RESIZE_WIDTH', 0)
# If set, provide imgsz to Ultralytics; 0 means default
ULTRA_IMG_SIZE = _get_int_env('AIC_IMGSZ', 0)
# Thread controls
TORCH_THREADS = _get_int_env('AIC_TORCH_THREADS', 0)
OPENCV_THREADS = _get_int_env('AIC_OPENCV_THREADS', 0)
AIC_DEVICE = os.environ.get('AIC_DEVICE', '').strip()  # e.g., 'cpu' or 'cuda:0'

# Apply thread settings early where possible
try:
    if OPENCV_THREADS and OPENCV_THREADS > 0:
        cv2.setNumThreads(OPENCV_THREADS)
except Exception:
    pass
try:
    if torch is not None and TORCH_THREADS and TORCH_THREADS > 0:
        torch.set_num_threads(TORCH_THREADS)
        # A simple heuristic for interop threads
        torch.set_num_interop_threads(max(1, TORCH_THREADS // 2))
except Exception:
    pass

# Global variables
current_target = "Fajar"
current_video = "pasar"
model = None
video_capture = None
is_streaming = False
stream_thread = None
target_lock = threading.Lock()  # Thread safety for target changes
video_lock = threading.Lock()   # Thread safety for video changes
metrics_lock = threading.Lock()  # Thread safety for metrics reads/writes
current_video_path = None  # Resolved path to the active video file

# Metrics storage (exponential moving averages)
metrics = {
    'frames_total': 0,
    'frames_encoded': 0,
    'frames_failed': 0,
    'detections_total': 0,
    'loop_ms_avg': 0.0,
    'capture_ms_avg': 0.0,
    'infer_ms_avg': 0.0,
    'overlay_ms_avg': 0.0,
    'encode_ms_avg': 0.0,
    'fps_avg': 0.0,
    'started_at': time.time(),
    'last_updated': time.time(),
}

def _ema_update(key: str, sample_ms: float, alpha: float = 0.9) -> None:
    with metrics_lock:
        prev = metrics.get(key, 0.0)
        metrics[key] = (prev * alpha) + (sample_ms * (1.0 - alpha))
        metrics['last_updated'] = time.time()

def _inc_counter(key: str, amount: int = 1) -> None:
    with metrics_lock:
        metrics[key] = metrics.get(key, 0) + amount
        metrics['last_updated'] = time.time()

# Lazy initialization for flask run import path
app_initialized = False
app_init_lock = threading.Lock()

def initialize_runtime_if_needed() -> None:
    global app_initialized
    if app_initialized:
        return
    with app_init_lock:
        if app_initialized:
            return
        try:
            if load_model(current_video):
                print("🚀 Runtime initialized via first request import path")
                start_video_stream()
                app_initialized = True
                return
            else:
                print("⚠️ Runtime init: model failed to load")
        except Exception as e:
            print(f"❌ Runtime init error: {e}")

# Video configurations
VIDEO_CONFIGS = {
    # Pasar Central - uses AI/PASAR assets (Philippine)
    "pasar": {
        "base_dir": "PASAR",
        "model_path": "models/Day_Philipine.pt",
        "video_path": "vidio/Day_Philipine.mp4",
        "default_target": "Fajar"
    },
    # Dublin - uses AI/MORN_CITY assets
    "dublin": {
        "base_dir": "MORN_CITY",
        "model_path": "models/Day_Dublin.pt",
        "video_path": "vidio/Day_Dublin.mp4",
        "default_target": "Dublin"
    },
    # Night City - uses AI/NIGHT_CITY assets
    "night_city": {
        "base_dir": "NIGHT_CITY",
        "model_path": "models/Night_Dublin.pt",
        "video_path": "vidio/Night_Dublin.mp4",
        "default_target": "George"
    }
}

def get_asset_dir(video_type: str) -> Path:
    config = VIDEO_CONFIGS.get(video_type, {})
    base_dir_name = config.get("base_dir", "MORN_CITY")
    return BASE_DIR / base_dir_name

def load_model(video_type):
    """Load YOLO model for specific video type"""
    global model
    try:
        base_dir = get_asset_dir(video_type)
        configured = (base_dir / VIDEO_CONFIGS[video_type]["model_path"]).resolve()
        model_path = configured
        if not model_path.exists():
            # Fallback: pick any .pt inside models dir
            models_dir = (base_dir / "models").resolve()
            candidates = list(models_dir.glob("*.pt")) if models_dir.exists() else []
            if candidates:
                model_path = candidates[0]
        if model_path.exists():
            model = YOLO(str(model_path))
            # Optionally move to specific device
            if AIC_DEVICE:
                try:
                    model.to(AIC_DEVICE)
                    print(f"🖥️  Model moved to device: {AIC_DEVICE}")
                except Exception as dev_e:
                    print(f"⚠️ Failed to move model to {AIC_DEVICE}: {dev_e}")
            print(f"✅ Model loaded: {model_path}")
            
            # Print available class names
            if hasattr(model, 'names'):
                print("📋 Available classes in model:")
                for class_id, class_name in model.names.items():
                    print(f"   {class_id}: {class_name}")
            else:
                print("⚠️ No class names found in model")
            
            return True
        else:
            print(f"❌ Model not found: {model_path}")
            return False
    except Exception as e:
        print(f"❌ Error loading model: {e}")
        return False

def get_class_id(target_name):
    """Get class ID for target person"""
    if model and hasattr(model, 'names'):
        names = model.names
        if isinstance(names, dict):
            for k, v in names.items():
                if str(v).strip().lower() == target_name.strip().lower():
                    return int(k)
    return None

def generate_frames():
    """Generate video frames with YOLO detection"""
    global current_target, current_video, model, video_capture, is_streaming
    
    if not model or not video_capture:
        print("❌ Model or video capture not available")
        return
    
    print(f"🎯 Starting frame generation for target: {current_target} (Video: {current_video})")
    
    frame_count = 0
    last_reset_time = time.time()
    
    while is_streaming:
        # Reset frame counter every 5 minutes to prevent overflow
        if time.time() - last_reset_time > 300:  # 5 minutes
            frame_count = 0
            last_reset_time = time.time()
            print("🔄 Frame counter reset")
        try:
            t_loop_start = perf_counter()
            t0 = perf_counter()
            ret, frame = video_capture.read()
            t1 = perf_counter()
            _ema_update('capture_ms_avg', (t1 - t0) * 1000.0)
            if not ret:
                print("🔄 Video ended, restarting...")
                video_capture.set(cv2.CAP_PROP_POS_FRAMES, 0)
                time.sleep(0.1)  # Small delay before restart
                continue
        except Exception as e:
            print(f"❌ Video read error: {e}")
            time.sleep(0.1)
            continue
        
        frame_count += 1
        _inc_counter('frames_total', 1)
        
        # Get current target class ID (updated every frame) with thread safety
        with target_lock:
            current_target_safe = current_target
        
        with video_lock:
            current_video_safe = current_video
            
        target_class_id = get_class_id(current_target_safe)
        
        try:
            # Optional resize to reduce compute
            if FRAME_RESIZE_WIDTH and FRAME_RESIZE_WIDTH > 0:
                h, w = frame.shape[:2]
                if w > FRAME_RESIZE_WIDTH:
                    new_h = int(h * (FRAME_RESIZE_WIDTH / float(w)))
                    frame = cv2.resize(frame, (FRAME_RESIZE_WIDTH, new_h), interpolation=cv2.INTER_AREA)

            # Run YOLO detection only for target class
            infer_kwargs = { 'conf': 0.25, 'verbose': False }
            if target_class_id is not None:
                infer_kwargs['classes'] = [target_class_id]
            if ULTRA_IMG_SIZE and ULTRA_IMG_SIZE > 0:
                infer_kwargs['imgsz'] = ULTRA_IMG_SIZE

            t_infer_start = perf_counter()
            results = model(frame, **infer_kwargs)
            t_infer_end = perf_counter()
            _ema_update('infer_ms_avg', (t_infer_end - t_infer_start) * 1000.0)
            
            # Process detections
            detections_found = 0
            if len(results) > 0:
                result = results[0]
                if result.boxes is not None and len(result.boxes) > 0:
                    boxes = result.boxes
                    class_names = result.names if hasattr(result, 'names') else getattr(model, "names", None)
                    
                    # Reduce debug output - only print every 30 frames
                    if frame_count % 30 == 0:
                        print(f"📊 Frame {frame_count}: Found {len(boxes)} detections")
                    
                    t_overlay_start = perf_counter()
                    for box in boxes:
                        cls_id = int(box.cls[0].cpu().numpy())
                        cls_name = class_names[cls_id] if class_names else f"Class {cls_id}"
                        x1, y1, x2, y2 = map(int, box.xyxy[0].cpu().numpy())
                        conf = float(box.conf[0].cpu().numpy())
                        
                        # Only show detection for target person
                        if str(cls_name).strip().lower() == current_target_safe.strip().lower():
                            color = (0, 255, 255)  # Yellow for target
                            cv2.rectangle(frame, (x1, y1), (x2, y2), color, 3)
                            label = f"🎯 {cls_name}: {conf:.2f}"
                            cv2.rectangle(frame, (x1, y1 - 25), (x1 + 200, y1), color, -1)
                            cv2.putText(frame, label, (x1, y1 - 5),
                                      cv2.FONT_HERSHEY_SIMPLEX, 0.6, (0, 0, 0), 2)
                            detections_found += 1
                            # Only print detection every 10 frames to reduce spam
                            if frame_count % 10 == 0:
                                print(f"🎯 Target '{current_target_safe}' detected with confidence: {conf:.2f}")
                    t_overlay_end = perf_counter()
                    _ema_update('overlay_ms_avg', (t_overlay_end - t_overlay_start) * 1000.0)
                    _inc_counter('detections_total', detections_found)
            
            # Add info overlay
            current_time = video_capture.get(cv2.CAP_PROP_POS_MSEC) / 1000
            minutes = int(current_time // 60)
            seconds = int(current_time % 60)
            
            cv2.putText(frame, f"Time: {minutes:02d}:{seconds:02d}",
                      (10, 30), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (255, 255, 255), 2)
            cv2.putText(frame, f"Video: {current_video_safe.upper()}",
                      (10, 60), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (255, 255, 0), 2)
            cv2.putText(frame, f"Target: {current_target_safe}",
                      (10, 90), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (0, 255, 255), 2)
            cv2.putText(frame, f"Frame: {frame_count}",
                      (10, 120), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (255, 255, 255), 2)
            cv2.putText(frame, f"Detections: {detections_found}",
                      (10, 150), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (0, 255, 255), 2)
            
        except Exception as e:
            print(f"❌ Error processing frame {frame_count}: {e}")
            # Add error message to frame
            cv2.putText(frame, f"Error: {str(e)}",
                      (10, 30), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (0, 0, 255), 2)
        
        # Convert frame to JPEG with timeout
        try:
            t_enc_start = perf_counter()
            ret, buffer = cv2.imencode('.jpg', frame, [cv2.IMWRITE_JPEG_QUALITY, JPEG_QUALITY])
            if ret:
                frame_bytes = buffer.tobytes()
                yield (b'--frame\r\n'
                       b'Content-Type: image/jpeg\r\n\r\n' + frame_bytes + b'\r\n')
                _inc_counter('frames_encoded', 1)
            else:
                print(f"❌ Failed to encode frame {frame_count}")
                _inc_counter('frames_failed', 1)
            t_enc_end = perf_counter()
            _ema_update('encode_ms_avg', (t_enc_end - t_enc_start) * 1000.0)
        except Exception as e:
            print(f"❌ Frame encoding error: {e}")
            _inc_counter('frames_failed', 1)
        
        # Control frame rate with adaptive timing
        try:
            t_loop_end = perf_counter()
            loop_ms = (t_loop_end - t_loop_start) * 1000.0
            _ema_update('loop_ms_avg', loop_ms)
            # Instantaneous FPS and EMA
            loop_s = max(1e-6, (t_loop_end - t_loop_start))
            inst_fps = 1.0 / loop_s
            _ema_update('fps_avg', inst_fps)

            # Sleep to maintain target FPS if configured
            if TARGET_FPS and TARGET_FPS > 0:
                target_ms = 1000.0 / float(TARGET_FPS)
                sleep_ms = max(0.0, target_ms - loop_ms)
                if sleep_ms > 0:
                    time.sleep(sleep_ms / 1000.0)
        except Exception as e:
            print(f"❌ Sleep error: {e}")

def start_video_stream(video_type=None):
    """Start video streaming thread"""
    global video_capture, is_streaming, stream_thread, current_video, current_video_path
    
    if is_streaming:
        return
    
    # Use provided video type or current
    if video_type:
        current_video = video_type
    
    base_dir = get_asset_dir(current_video)
    configured = (base_dir / VIDEO_CONFIGS[current_video]["video_path"]).resolve()
    video_path = configured
    if not video_path.exists():
        # Fallback: first mp4 in vidio dir
        vid_dir = (base_dir / "vidio").resolve()
        candidates = list(vid_dir.glob("*.mp4")) if vid_dir.exists() else []
        if candidates:
            video_path = candidates[0]
    if not video_path.exists():
        print(f"❌ Video not found: {video_path}")
        return
    
    current_video_path = str(video_path)
    video_capture = cv2.VideoCapture(str(video_path))
    if not video_capture.isOpened():
        print(f"❌ Could not open video: {video_path}")
        return
    
    is_streaming = True
    stream_thread = threading.Thread(target=generate_frames)
    stream_thread.daemon = True
    stream_thread.start()
    print(f"🎬 Video streaming started for {current_video}")

@app.route('/metrics')
def get_metrics():
    """Expose lightweight runtime metrics for profiling."""
    initialize_runtime_if_needed()
    # Snapshot under lock
    with metrics_lock:
        snapshot = dict(metrics)

    system = {}
    if psutil is not None:
        try:
            proc = psutil.Process(os.getpid())
            with proc.oneshot():
                rss = proc.memory_info().rss
                cpu = proc.cpu_percent(interval=0.0)
                num_threads = proc.num_threads()
            system = {
                'process_rss_bytes': rss,
                'process_cpu_percent': cpu,
                'process_threads': num_threads,
            }
        except Exception:
            system = {}

    stream_state = {
        'is_streaming': is_streaming,
        'video_opened': bool(video_capture is not None and getattr(video_capture, 'isOpened', lambda: False)()),
        'video_path': current_video_path,
    }

    config = {
        'target_fps': TARGET_FPS,
        'jpeg_quality': JPEG_QUALITY,
        'resize_width': FRAME_RESIZE_WIDTH,
        'ultra_img_size': ULTRA_IMG_SIZE,
        'torch_threads': TORCH_THREADS,
        'opencv_threads': OPENCV_THREADS,
        'device': AIC_DEVICE or None,
        'current_video': current_video,
        'current_target': current_target,
        'model_loaded': model is not None,
    }

    return jsonify({'metrics': snapshot, 'system': system, 'config': config, 'stream': stream_state})

@app.route('/stream_state')
def get_stream_state():
    """Detailed stream state for debugging."""
    initialize_runtime_if_needed()
    state = {
        'is_streaming': is_streaming,
        'video_capture_opened': bool(video_capture is not None and getattr(video_capture, 'isOpened', lambda: False)()),
        'current_video': current_video,
        'current_video_path': current_video_path,
        'model_loaded': model is not None,
    }
    return jsonify(state)

@app.route('/')
def index():
    """Serve Vue.js frontend"""
    initialize_runtime_if_needed()
    return render_template('index.html', 
                         current_target=current_target,
                         current_video=current_video,
                         status=None)

@app.route('/video_feed')
def video_feed():
    """Video streaming endpoint"""
    initialize_runtime_if_needed()
    return Response(generate_frames(),
                    mimetype='multipart/x-mixed-replace; boundary=frame')

@app.route('/set_target', methods=['POST'])
def set_target():
    """Change target person"""
    global current_target
    initialize_runtime_if_needed()
    
    try:
        data = request.get_json()
        new_target = data.get('name', '').strip()
        
        if not new_target:
            return jsonify({'error': 'Nama target tidak boleh kosong'}), 400
        
        # Update target without restarting stream (thread safe)
        with target_lock:
            current_target = new_target
        print(f"🎯 Target changed to: {current_target}")
        
        return jsonify({
            'message': f'Target berhasil diubah ke {current_target}',
            'target': current_target
        })
    
    except Exception as e:
        return jsonify({'error': f'Error: {str(e)}'}), 500

@app.route('/set_video', methods=['POST'])
def set_video():
    """Change video source"""
    global current_video, current_target, is_streaming, video_capture
    initialize_runtime_if_needed()
    
    try:
        data = request.get_json()
        new_video = data.get('video', '').strip().lower()
        
        if new_video not in VIDEO_CONFIGS:
            return jsonify({'error': 'Video tidak valid. Pilih: pasar, dublin, atau night_city'}), 400
        
        # Stop current stream
        if is_streaming:
            is_streaming = False
            if video_capture:
                video_capture.release()
                video_capture = None
            time.sleep(0.5)  # Wait for thread to stop
        
        # Update video and target
        with video_lock:
            current_video = new_video
        
        # Set default target for new video
        current_target = VIDEO_CONFIGS[current_video]["default_target"]
        
        # Load new model
        if not load_model(current_video):
            return jsonify({'error': 'Gagal memuat model untuk video ini'}), 500
        
        # Start new stream (ensure fresh capture)
        start_video_stream(current_video)
        
        print(f"🎬 Video changed to: {current_video}")
        
        return jsonify({
            'message': f'Video berhasil diubah ke {current_video}',
            'video': current_video,
            'target': current_target
        })
    
    except Exception as e:
        return jsonify({'error': f'Error: {str(e)}'}), 500

@app.route('/get_target')
def get_target():
    """Get current target"""
    initialize_runtime_if_needed()
    return jsonify({'target': current_target})

@app.route('/get_video')
def get_video():
    """Get current video"""
    initialize_runtime_if_needed()
    return jsonify({'video': current_video})

@app.route('/get_available_videos')
def get_available_videos():
    """Get list of available videos"""
    initialize_runtime_if_needed()
    return jsonify({
        'videos': list(VIDEO_CONFIGS.keys()),
        'current_video': current_video
    })

@app.route('/start_stream')
def start_stream():
    """Start video streaming"""
    initialize_runtime_if_needed()
    start_video_stream()
    return jsonify({'message': 'Video streaming started'})

@app.route('/stop_stream')
def stop_stream():
    """Stop video streaming"""
    global is_streaming, video_capture
    initialize_runtime_if_needed()
    
    is_streaming = False
    if video_capture:
        video_capture.release()
        video_capture = None
    
    return jsonify({'message': 'Video streaming stopped'})

@app.route('/restart_stream')
def restart_stream():
    """Restart video streaming with current settings"""
    global is_streaming, video_capture
    initialize_runtime_if_needed()
    
    # Stop current stream
    if is_streaming:
        is_streaming = False
        if video_capture:
            video_capture.release()
            video_capture = None
        time.sleep(0.5)  # Wait for thread to stop
    
    # Start new stream
    start_video_stream()
    
    return jsonify({'message': 'Video streaming restarted'})

if __name__ == '__main__':
    # Load initial model
    if load_model(current_video):
        host = os.environ.get('FLASK_HOST', '0.0.0.0')
        port = int(os.environ.get('FLASK_PORT', '5001'))
        debug_env = os.environ.get('FLASK_DEBUG', 'true').lower()
        debug = debug_env in ('1', 'true', 'yes', 'on')

        print("🚀 Flask app starting...")
        print(f"📱 Base URL: http://{host}:{port}")
        print(f"🎬 Video stream: http://{host}:{port}/video_feed")
        print(f"🎯 Current video: {current_video}")
        print(f"🎯 Current target: {current_target}")
        print(f"🧪 Metrics endpoint: http://{host}:{port}/metrics")
        print(f"⚙️  Config -> FPS: {TARGET_FPS}, JPEG: {JPEG_QUALITY}, ResizeW: {FRAME_RESIZE_WIDTH}, ImgSz: {ULTRA_IMG_SIZE}, TorchThreads: {TORCH_THREADS}, OpenCVThreads: {OPENCV_THREADS}, Device: {AIC_DEVICE or 'auto'}")
        
        # Start video streaming
        start_video_stream()
        
        # Run Flask app
        app.run(host=host, port=port, debug=debug, threaded=True)
    else:
        print("❌ Failed to load model. Exiting...")

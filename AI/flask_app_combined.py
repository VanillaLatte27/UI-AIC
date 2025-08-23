from flask import Flask, render_template, Response, request, jsonify
from flask_cors import CORS
from ultralytics import YOLO
import cv2
import numpy as np
import threading
import time
from pathlib import Path
import threading

app = Flask(__name__)
CORS(app)  # Enable CORS for Vue.js frontend

# Base directories
BASE_DIR = Path(__file__).resolve().parent
DEFAULT_ASSET_DIR = BASE_DIR / "MORN_CITY"
TEMPLATE_DIR = BASE_DIR / "PASAR" / "templates"

# Ensure Flask knows where templates live (reuse PASAR templates)
app.template_folder = str(TEMPLATE_DIR)

# Global variables
current_target = "Fajar"
current_video = "pasar"
model = None
video_capture = None
is_streaming = False
stream_thread = None
target_lock = threading.Lock()  # Thread safety for target changes
video_lock = threading.Lock()   # Thread safety for video changes

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
            ret, frame = video_capture.read()
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
        
        # Get current target class ID (updated every frame) with thread safety
        with target_lock:
            current_target_safe = current_target
        
        with video_lock:
            current_video_safe = current_video
            
        target_class_id = get_class_id(current_target_safe)
        
        try:
            # Run YOLO detection only for target class
            if target_class_id is not None:
                results = model(frame, conf=0.25, classes=[target_class_id], verbose=False)
            else:
                results = model(frame, conf=0.25, verbose=False)
            
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
            ret, buffer = cv2.imencode('.jpg', frame, [cv2.IMWRITE_JPEG_QUALITY, 85])
            if ret:
                frame_bytes = buffer.tobytes()
                yield (b'--frame\r\n'
                       b'Content-Type: image/jpeg\r\n\r\n' + frame_bytes + b'\r\n')
            else:
                print(f"❌ Failed to encode frame {frame_count}")
        except Exception as e:
            print(f"❌ Frame encoding error: {e}")
        
        # Control frame rate with adaptive timing
        try:
            time.sleep(1/25)  # Reduced to 25 FPS for stability
        except Exception as e:
            print(f"❌ Sleep error: {e}")

def start_video_stream(video_type=None):
    """Start video streaming thread"""
    global video_capture, is_streaming, stream_thread, current_video
    
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
    
    video_capture = cv2.VideoCapture(str(video_path))
    if not video_capture.isOpened():
        print(f"❌ Could not open video: {video_path}")
        return
    
    is_streaming = True
    stream_thread = threading.Thread(target=generate_frames)
    stream_thread.daemon = True
    stream_thread.start()
    print(f"🎬 Video streaming started for {current_video}")

@app.route('/')
def index():
    """Serve Vue.js frontend"""
    return render_template('index.html', 
                         current_target=current_target,
                         current_video=current_video,
                         status=None)

@app.route('/video_feed')
def video_feed():
    """Video streaming endpoint"""
    return Response(generate_frames(),
                    mimetype='multipart/x-mixed-replace; boundary=frame')

@app.route('/set_target', methods=['POST'])
def set_target():
    """Change target person"""
    global current_target
    
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
    return jsonify({'target': current_target})

@app.route('/get_video')
def get_video():
    """Get current video"""
    return jsonify({'video': current_video})

@app.route('/get_available_videos')
def get_available_videos():
    """Get list of available videos"""
    return jsonify({
        'videos': list(VIDEO_CONFIGS.keys()),
        'current_video': current_video
    })

@app.route('/start_stream')
def start_stream():
    """Start video streaming"""
    start_video_stream()
    return jsonify({'message': 'Video streaming started'})

@app.route('/stop_stream')
def stop_stream():
    """Stop video streaming"""
    global is_streaming, video_capture
    
    is_streaming = False
    if video_capture:
        video_capture.release()
        video_capture = None
    
    return jsonify({'message': 'Video streaming stopped'})

@app.route('/restart_stream')
def restart_stream():
    """Restart video streaming with current settings"""
    global is_streaming, video_capture
    
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
        print("🚀 Flask app starting...")
        print("📱 Frontend: http://localhost:5000")
        print("🎬 Video stream: http://localhost:5000/video_feed")
        print(f"🎯 Current video: {current_video}")
        print(f"🎯 Current target: {current_target}")
        
        # Start video streaming
        start_video_stream()
        
        # Run Flask app
        app.run(host='0.0.0.0', port=5000, debug=True, threaded=True)
    else:
        print("❌ Failed to load model. Exiting...")

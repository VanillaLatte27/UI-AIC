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

# Global variables
current_target = "Dublin"
model = None
video_capture = None
is_streaming = False
stream_thread = None
target_lock = threading.Lock()  # Thread safety for target changes

def load_model():
    """Load YOLO model"""
    global model
    try:
        model_path = "models/Day_Dublin.pt"
        if Path(model_path).exists():
            model = YOLO(model_path)
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
    global current_target, model, video_capture, is_streaming
    
    if not model or not video_capture:
        print("❌ Model or video capture not available")
        return
    
    print(f"🎯 Starting frame generation for target: {current_target}")
    
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
            cv2.putText(frame, f"Target: {current_target_safe}",
                      (10, 60), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (0, 255, 255), 2)
            cv2.putText(frame, f"Frame: {frame_count}",
                      (10, 90), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (255, 255, 255), 2)
            cv2.putText(frame, f"Detections: {detections_found}",
                      (10, 120), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (0, 255, 255), 2)
            
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

def start_video_stream():
    """Start video streaming thread"""
    global video_capture, is_streaming, stream_thread
    
    if is_streaming:
        return
    
    video_path = "vidio/Day_Dublin.mp4"
    if not Path(video_path).exists():
        print(f"❌ Video not found: {video_path}")
        return
    
    video_capture = cv2.VideoCapture(video_path)
    if not video_capture.isOpened():
        print(f"❌ Could not open video: {video_path}")
        return
    
    is_streaming = True
    stream_thread = threading.Thread(target=generate_frames)
    stream_thread.daemon = True
    stream_thread.start()
    print("🎬 Video streaming started")

@app.route('/')
def index():
    """Serve Vue.js frontend"""
    return render_template('index.html', 
                         current_target=current_target,
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

@app.route('/get_target')
def get_target():
    """Get current target"""
    return jsonify({'target': current_target})

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

if __name__ == '__main__':
    # Load model on startup
    if load_model():
        print("🚀 Flask app starting...")
        print("📱 Frontend: http://localhost:5000")
        print("🎬 Video stream: http://localhost:5000/video_feed")
        
        # Start video streaming
        start_video_stream()
        
        # Run Flask app
        app.run(host='0.0.0.0', port=5000, debug=True, threaded=True)
    else:
        print("❌ Failed to load model. Exiting...")

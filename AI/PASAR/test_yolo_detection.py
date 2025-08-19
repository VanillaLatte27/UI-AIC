from ultralytics import YOLO
import cv2
from pathlib import Path

def test_yolo_detection():
    """Test YOLO detection on a single frame"""
    
    # Load model
    model_path = "models/Day_Philipine.pt"
    if not Path(model_path).exists():
        print(f"❌ Model not found: {model_path}")
        return
    
    print(f"🔍 Loading model: {model_path}")
    model = YOLO(model_path)
    
    # Print available classes
    if hasattr(model, 'names'):
        print("📋 Available classes in model:")
        for class_id, class_name in model.names.items():
            print(f"   {class_id}: {class_name}")
    else:
        print("⚠️ No class names found in model")
    
    # Load video
    video_path = "vidio/Day_Philipine.mp4"
    if not Path(video_path).exists():
        print(f"❌ Video not found: {video_path}")
        return
    
    print(f"📹 Loading video: {video_path}")
    cap = cv2.VideoCapture(video_path)
    
    if not cap.isOpened():
        print(f"❌ Could not open video: {video_path}")
        return
    
    # Read first few frames and test detection
    for frame_num in range(5):
        ret, frame = cap.read()
        if not ret:
            print(f"❌ Could not read frame {frame_num}")
            break
        
        print(f"\n🎬 Testing frame {frame_num + 1}")
        
        # Run YOLO detection
        results = model(frame, conf=0.25, verbose=False)
        
        if len(results) > 0:
            result = results[0]
            if result.boxes is not None and len(result.boxes) > 0:
                boxes = result.boxes
                class_names = result.names if hasattr(result, 'names') else getattr(model, "names", None)
                
                print(f"   📊 Found {len(boxes)} detections:")
                
                for i, box in enumerate(boxes):
                    cls_id = int(box.cls[0].cpu().numpy())
                    cls_name = class_names[cls_id] if class_names else f"Class {cls_id}"
                    conf = float(box.conf[0].cpu().numpy())
                    
                    print(f"      {i+1}. {cls_name} (ID: {cls_id}) - Confidence: {conf:.3f}")
            else:
                print("   ❌ No detections found")
        else:
            print("   ❌ No results from model")
    
    cap.release()
    print("\n✅ YOLO detection test completed!")

if __name__ == "__main__":
    test_yolo_detection() 
from ultralytics import YOLO
import cv2
from pathlib import Path
import time
import sys

# ======== CONFIG ========
CONF_THRESHOLD = 0.25
TARGETS = ["Fajar", "Budi", "Siti"]  # list target untuk cycle pakai tombol 't'

# ======== UTILS ========
def load_yolo_model(model_path):
    """Load YOLO model using Ultralytics"""
    try:
        model = YOLO(model_path)
        print(f"✅ YOLO model loaded successfully from {model_path}")
        return model
    except Exception as e:
        print(f"❌ Error loading YOLO model: {e}")
        return None

def format_ts(ms):
    """Convert milliseconds to mm:ss"""
    s = int(ms // 1000)
    return f"{s//60:02d}:{s%60:02d}"

# ======== REAL-TIME TRACKER ========
def realtime_person_tracker(model_path, video_path, target_person="Fajar", conf_threshold=0.25):
    print("🚀 Starting real-time person tracker (ONLY target)...")

    model = load_yolo_model(model_path)
    if model is None:
        return

    cap = cv2.VideoCapture(video_path, cv2.CAP_FFMPEG)
    if not cap.isOpened():
        print(f"❌ Could not open video {video_path}")
        return

    total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
    fps = cap.get(cv2.CAP_PROP_FPS) or 30.0
    duration = total_frames / fps if fps > 0 else 0.0

    print(f"📹 Video Info:")
    print(f"   Frames : {total_frames}")
    print(f"   FPS    : {fps:.2f}")
    print(f"   Durasi : {duration:.2f}s")
    print(f"   Target : {target_person}")
    print(f"   Conf   : {conf_threshold}")
    print("🎬 Controls: q=quit, p=pause/resume, s=save, r=restart, t=next target")

    # Window
    win_name = f"Real-time Tracker - {target_person}"
    cv2.namedWindow(win_name, cv2.WINDOW_NORMAL)
    cv2.resizeWindow(win_name, 960, 540)

    # Anchor waktu real-time
    paused = False
    target_detections = 0
    playback_anchor_wall = None
    anchor_video_ms = 0.0

    target_person_l = target_person.strip().lower()
    target_class_id = get_class_id(model, target_person_l)

    while True:
        if not paused:
            ret, frame = cap.read()
            if not ret:
                cap.set(cv2.CAP_PROP_POS_FRAMES, 0)
                target_detections = 0
                playback_anchor_wall = None
                anchor_video_ms = 0.0
                print("🔄 Restart video")
                continue
        else:
            frame_display = frame.copy()
            cv2.putText(frame_display, "PAUSED", (frame_display.shape[1] - 150, 30),
                        cv2.FONT_HERSHEY_SIMPLEX, 0.8, (0, 0, 255), 2)
            cv2.imshow(win_name, frame_display)
            key = cv2.waitKey(30) & 0xFF
            if not handle_keys(key, cap, model, target_person, target_detections):
                break
            continue

        current_ms = cap.get(cv2.CAP_PROP_POS_MSEC)
        if playback_anchor_wall is None:
            playback_anchor_wall = time.time()
            anchor_video_ms = current_ms

        display_frame = frame.copy()

        # === DETEKSI target ===
        try:
            if target_class_id is not None:
                results = model(display_frame, conf=conf_threshold, classes=[target_class_id], verbose=False)
            else:
                results = model(display_frame, conf=conf_threshold, verbose=False)

            frame_target = 0
            if len(results) > 0:
                result = results[0]
                if result.boxes is not None and len(result.boxes) > 0:
                    boxes = result.boxes
                    class_names = result.names if hasattr(result, 'names') else getattr(model, "names", None)

                    for box in boxes:
                        cls_id = int(box.cls[0].cpu().numpy())
                        cls_name = class_names[cls_id] if class_names else f"Class {cls_id}"

                        if str(cls_name).strip().lower() != target_person_l:
                            continue

                        x1, y1, x2, y2 = map(int, box.xyxy[0].cpu().numpy())
                        conf = float(box.conf[0].cpu().numpy())

                        color = (0, 255, 255)
                        cv2.rectangle(display_frame, (x1, y1), (x2, y2), color, 2)
                        label = f"🎯 {cls_name}: {conf:.2f}"
                        cv2.rectangle(display_frame, (x1, y1 - 25), (x1 + 200, y1), color, -1)
                        cv2.putText(display_frame, label, (x1, y1 - 5),
                                    cv2.FONT_HERSHEY_SIMPLEX, 0.6, (0, 0, 0), 2)
                        frame_target += 1

            if frame_target > 0:
                target_detections += frame_target
                cv2.putText(display_frame, f"Detections ({target_person}): {frame_target}",
                            (10, 30), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 255, 255), 2)
            else:
                cv2.putText(display_frame, f"{target_person} not detected",
                            (10, 30), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 0, 255), 2)

        except Exception as e:
            print(f"❌ Error processing at {format_ts(current_ms)}: {e}")
            cv2.putText(display_frame, "Error processing", (10, 30),
                        cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 0, 255), 2)

        # Overlay waktu
        cv2.putText(display_frame, f"Time: {format_ts(current_ms)}",
                    (10, 90), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (255, 255, 255), 2)
        cv2.putText(display_frame, f"Frame: {int(cap.get(cv2.CAP_PROP_POS_FRAMES))}/{total_frames}",
                    (10, 120), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (255, 255, 255), 2)
        cv2.putText(display_frame, f"Target: {target_person}",
                    (10, 150), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (0, 255, 255), 2)
        cv2.putText(display_frame, f"Total {target_person}: {target_detections}",
                    (10, 180), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (0, 255, 255), 2)

        # Real-time sync
        desired_wall = playback_anchor_wall + (current_ms - anchor_video_ms) / 1000.0
        now = time.time()
        diff = desired_wall - now

        cv2.imshow(win_name, display_frame)
        if diff > 0:
            key = cv2.waitKey(max(1, min(int(diff * 1000), 30))) & 0xFF
        else:
            cap.grab()
            key = cv2.waitKey(1) & 0xFF

        if not handle_keys(key, cap, model, target_person, target_detections):
            break

    cap.release()
    cv2.destroyAllWindows()

# ======== HELPER FUNCTIONS ========
def get_class_id(model, target_person_l):
    names = getattr(model, "names", None)
    if isinstance(names, dict):
        for k, v in names.items():
            if str(v).strip().lower() == target_person_l:
                return int(k)
    return None

def handle_keys(key, cap, model, target_person, target_detections):
    """Handle key events; return False to exit"""
    global TARGETS
    if key == ord('q'):
        return False
    elif key == ord('p'):
        return True  # pause handled in loop
    elif key == ord('s'):
        filename = f"saved_frame_{int(cap.get(cv2.CAP_PROP_POS_FRAMES)):04d}.jpg"
        ret, frame = cap.read()
        if ret:
            cv2.imwrite(filename, frame)
            print(f"Frame saved: {filename}")
    elif key == ord('r'):
        cap.set(cv2.CAP_PROP_POS_FRAMES, 0)
        print("Restarted video")
    elif key == ord('t'):
        # cycle to next target
        try:
            idx = TARGETS.index(target_person)
        except ValueError:
            idx = -1
        target_person = TARGETS[(idx + 1) % len(TARGETS)]
        print(f"Target changed to: {target_person}")
    return True

# ======== MAIN ========
if __name__ == "__main__":
    model_path = "models/Day_Philipine.pt"
    video_path = "vidio/Day_Philipine.mp4"

    if not Path(model_path).exists():
        print(f"❌ Model not found: {model_path}")
        sys.exit(1)
    if not Path(video_path).exists():
        print(f"❌ Video not found: {video_path}")
        sys.exit(1)

    realtime_person_tracker(model_path, video_path, target_person="Fajar", conf_threshold=CONF_THRESHOLD)

from ultralytics import YOLO
import cv2
from pathlib import Path
import time
import sys

# ======== CONFIG ========
CONF_THRESHOLD = 0.25
TARGETS = []

# ======== UTILS ========
def load_yolo_model(model_path):
    try:
        model = YOLO(model_path)
        print(f"✅ YOLO model loaded successfully from {model_path}")
        return model
    except Exception as e:
        print(f"❌ Error loading YOLO model: {e}")
        return None

def format_ts(ms):
    s = int(ms // 1000)
    return f"{s//60:02d}:{s%60:02d}"

# ======== REAL-TIME TRACKER ========
def realtime_person_tracker(model_path, video_path, target_person="Fajar", conf_threshold=0.25):
    print(f"🚀 Starting real-time person tracker (ONLY target: {target_person})...")

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
    print("🎬 Controls: q=quit, p=pause/resume, r=restart, t=next target")

    win_name = f"Real-time Tracker - {target_person}"
    cv2.namedWindow(win_name, cv2.WINDOW_NORMAL)
    cv2.resizeWindow(win_name, 960, 540)

    # ===== Video Writer untuk demo =====
    fourcc = cv2.VideoWriter_fourcc(*'mp4v')
    out = cv2.VideoWriter(
        "demo_output.mp4",
        fourcc,
        fps,
        (int(cap.get(cv2.CAP_PROP_FRAME_WIDTH)), int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT)))
    )

    paused = False
    playback_anchor_wall = None
    anchor_video_ms = 0.0

    target_person_l = target_person.strip().lower()
    target_class_id = get_class_id(model, target_person_l)

    while True:
        if not paused:
            ret, frame = cap.read()
            if not ret:
                break
        else:
            frame_display = frame.copy()
            cv2.putText(frame_display, "PAUSED", (frame_display.shape[1] - 150, 30),
                        cv2.FONT_HERSHEY_SIMPLEX, 0.8, (0, 0, 255), 2)
            cv2.imshow(win_name, frame_display)
            key = cv2.waitKey(30) & 0xFF
            target_person, target_class_id = handle_keys(key, cap, model, target_person)
            if target_person is None:
                break
            target_person_l = target_person.strip().lower()
            win_name = f"Real-time Tracker - {target_person}"
            continue

        current_ms = cap.get(cv2.CAP_PROP_POS_MSEC)
        if playback_anchor_wall is None:
            playback_anchor_wall = time.time()
            anchor_video_ms = current_ms

        display_frame = frame.copy()

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
                cv2.putText(display_frame, f"Detections ({target_person}): {frame_target}",
                            (10, 30), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 255, 255), 2)
            else:
                cv2.putText(display_frame, f"{target_person} not detected",
                            (10, 30), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 0, 255), 2)

        except Exception as e:
            print(f"❌ Error processing at {format_ts(current_ms)}: {e}")
            cv2.putText(display_frame, "Error processing", (10, 30),
                        cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 0, 255), 2)

        # Overlay info (tanpa Frame & Total Target)
        cv2.putText(display_frame, f"Time: {format_ts(current_ms)}",
                    (10, 90), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (255, 255, 255), 2)
        cv2.putText(display_frame, f"Target: {target_person}",
                    (10, 120), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (0, 255, 255), 2)

        # ===== Save ke file video =====
        out.write(display_frame)

        # Tampilkan di window
        cv2.imshow(win_name, display_frame)
        key = cv2.waitKey(1) & 0xFF
        target_person, target_class_id = handle_keys(key, cap, model, target_person)
        if target_person is None:
            break
        target_person_l = target_person.strip().lower()
        win_name = f"Real-time Tracker - {target_person}"

    cap.release()
    out.release()
    cv2.destroyAllWindows()
    print("💾 Video demo tersimpan: demo_output.mp4")

# ======== HELPER FUNCTIONS ========
def get_class_id(model, target_person_l):
    names = getattr(model, "names", None)
    if isinstance(names, dict):
        for k, v in names.items():
            if str(v).strip().lower() == target_person_l:
                return int(k)
    return None

def handle_keys(key, cap, model, target_person):
    global TARGETS
    if key == ord('q'):
        return None, None
    elif key == ord('p'):
        return target_person, get_class_id(model, target_person.strip().lower())
    elif key == ord('r'):
        cap.set(cv2.CAP_PROP_POS_FRAMES, 0)
        print("Restarted video")
    elif key == ord('t'):
        if TARGETS:
            try:
                idx = TARGETS.index(target_person)
            except ValueError:
                idx = -1
            target_person = TARGETS[(idx + 1) % len(TARGETS)]
            print(f"Target changed to: {target_person}")
    return target_person, get_class_id(model, target_person.strip().lower())

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

    target_input = input("Masukkan nama target yang ingin dicari (pisahkan koma jika banyak): ").strip()
    if target_input:
        TARGETS = [t.strip() for t in target_input.split(",") if t.strip()]
    else:
        TARGETS = ["Fajar"]

    realtime_person_tracker(model_path, video_path, target_person=TARGETS[0], conf_threshold=CONF_THRESHOLD)

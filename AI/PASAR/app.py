from flask import Flask, Response, request, jsonify
import cv2
from ultralytics import YOLO

app = Flask(__name__)
model = YOLO("models/Day_Philipine.pt")  # Model YOLO kamu

video_path = "vidio/Day_Philipine.mp4"
cap = cv2.VideoCapture(video_path)

target_name = "Fajar"  # Default target

def generate_frames():
    global target_name
    while True:
        success, frame = cap.read()
        if not success:
            cap.set(cv2.CAP_PROP_POS_FRAMES, 0)  # ulang dari awal
            continue

        results = model(frame, conf=0.25, verbose=False)

        for result in results:
            if result.boxes is not None:
                for box in result.boxes:
                    cls_name = result.names[int(box.cls[0])]
                    if cls_name.lower() != target_name.lower():
                        continue
                    x1, y1, x2, y2 = map(int, box.xyxy[0])
                    cv2.rectangle(frame, (x1, y1), (x2, y2), (0, 255, 255), 2)
                    cv2.putText(frame, f"{cls_name}", (x1, y1 - 5),
                                cv2.FONT_HERSHEY_SIMPLEX, 0.6, (0, 255, 255), 2)

        ret, buffer = cv2.imencode('.jpg', frame)
        frame_bytes = buffer.tobytes()

        yield (b'--frame\r\n'
               b'Content-Type: image/jpeg\r\n\r\n' + frame_bytes + b'\r\n')

@app.route('/video_feed')
def video_feed():
    return Response(generate_frames(),
                    mimetype='multipart/x-mixed-replace; boundary=frame')

@app.route('/set_target', methods=['POST'])
def set_target():
    global target_name
    data = request.json
    if not data or 'name' not in data:
        return jsonify({"error": "Missing 'name' field"}), 400
    target_name = data['name']
    return jsonify({"message": f"Target changed to {target_name}"}), 200

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)

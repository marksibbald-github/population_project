import cv2
from flask import Flask, Response, request, jsonify
from flask_cors import CORS
from ultralytics import YOLO
from flask_socketio import SocketIO, emit
import time


class Alert:
    def __init__(self, area_name, alert_message):
        self.area_name = area_name
        self.alert_message = alert_message

alerts = []


CONFIDENCE_THRESHOLD = 0.1
RECTANGLE_THICKNESS = 2
TEXT_THICKNESS = 1

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})
socketio = SocketIO(app, cors_allowed_origins="http://localhost:3000")


model = YOLO('yolov9c.pt')

@socketio.on('connect')
def handle_connect():
    print('Client connected')

@socketio.on('disconnect')
def handle_disconnect():
    print('Client disconnected')

def predict(chosen_model, img, classes=[]):       
    results = chosen_model.predict(img, classes=classes, conf=CONFIDENCE_THRESHOLD)
    return results

# Global dictionary to track alert statuses for each video (this ensures only the first alert is sent)
alert_sent = {}

def predict_and_detect(video_path, chosen_model, img, classes=[0]):
    resized_img = cv2.resize(img, (640, 480))
    results = predict(chosen_model, resized_img, classes)
    person_count = 0

    for result in results:
        for box in result.boxes:
            if result.names[int(box.cls[0])] == 'person':
                person_count += 1
            scale_width = img.shape[1] / 640
            scale_height = img.shape[0] / 480
            x1 = int(box.xyxy[0][0] * scale_width)
            y1 = int(box.xyxy[0][1] * scale_height)
            x2 = int(box.xyxy[0][2] * scale_width)
            y2 = int(box.xyxy[0][3] * scale_height)
            cv2.rectangle(img, (x1, y1), (x2, y2), (255, 0, 0), RECTANGLE_THICKNESS)
            cv2.putText(img, f"{result.names[int(box.cls[0])]}",
                        (x1, y1 - 10),
                        cv2.FONT_HERSHEY_PLAIN, 1, (255, 0, 0), TEXT_THICKNESS)

    # Check if an alert has already been sent for this video
    if person_count > 20 and not alert_sent.get(video_path, False):
        alert_message = f"High density detected: {person_count} people."
        alerts.append(Alert(video_path, alert_message))
        socketio.emit('new_alert', {'area_name': video_path, 'alert_message': alert_message}, include_self=True)
        alert_sent[video_path] = True  # Set the flag to True after sending the alert

    _, buffer = cv2.imencode('.jpg', img)
    return buffer.tobytes()


@app.route('/process_video', methods=['GET', 'POST'])
def handle_process_video():
    if request.method == 'GET':
        video_path = request.args.get('videoPath', 'busy2.mp4')
    else:
        video_path = request.json.get('videoPath', 'busy2.mp4')

    cap = cv2.VideoCapture(video_path)

    def generate():
        frame_rate = 5  # frames per second
        prev = 0
        while True:
            time_elapsed = time.time() - prev
            ret, frame = cap.read()
            if not ret:
                break
            if time_elapsed > 1./frame_rate:
                prev = time.time()
                processed_frame = predict_and_detect(video_path, model, frame, classes=[0])
                yield (b'--frame\r\n'
                    b'Content-Type: image/jpeg\r\n\r\n' + processed_frame + b'\r\n')


    return Response(generate(), mimetype='multipart/x-mixed-replace; boundary=frame')


@app.route('/get_stream_url', methods=['GET'])
def get_stream_url():
    return jsonify({'streamUrl': 'http://127.0.0.1:5000/process_video'})

if __name__ == "__main__":
    socketio.run(app, debug=True, port=5000)

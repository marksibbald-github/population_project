import cv2
from flask import Flask, Response, request, jsonify, make_response, stream_with_context
from flask_cors import CORS, cross_origin
from ultralytics import YOLO
from flask_socketio import SocketIO, emit
import time
import os
import json

# Class for Alerts
class Alert:
    def __init__(self, video_path, alert_message):
        self.video_path = video_path
        self.alert_message = alert_message

# Global variables 
alerts = []
alert_sent = {}
alert_threshold = 20
model = YOLO('yolov9c.pt')

# Constants
CONFIDENCE_THRESHOLD = 0.1
RECTANGLE_THICKNESS = 2
TEXT_THICKNESS = 1


app = Flask(__name__)
CORS(app, resources={r"*": {"origins": "*"}}, supports_credentials=True)
socketio = SocketIO(app, cors_allowed_origins="*") 

video_metadata_path = os.path.join(app.root_path, 'video_metadata.json')
with open(video_metadata_path, 'r') as file:
    video_metadata = json.load(file)

def get_video_area(file_name):
    for video in video_metadata:
        if video['file_name'] == file_name:
            return video['area']
    return "Unknown area"


# Routes
@app.route('/update_threshold', methods=['POST'])
@cross_origin()
def update_threshold():
    global alert_threshold
    data = request.get_json()
    alert_threshold = int(data.get('threshold', 20)) 
    return jsonify({"status": "Threshold set to {}".format(alert_threshold)})

@app.route('/reset_alerts', methods=['POST'])
def reset_alerts():
    alert_sent.clear()
    return jsonify({"status": "All alert states have been reset"})

@app.route('/list_videos', methods=['GET'])
@cross_origin()
def list_videos():
    json_path = os.path.join(app.root_path, 'video_metadata.json')
    with open(json_path, 'r') as file:
        videos = json.load(file)
    return jsonify(videos)

@app.route('/process_video', methods=['GET', 'POST'])
def handle_process_video():
    global alert_threshold

    if request.method == 'GET':
        video_path = request.args.get('videoPath')
    else:
        video_path = request.json.get('videoPath')

    cap = cv2.VideoCapture(video_path)

    def generate_frames():
        frame_rate = 5  # frames per second
        prev = 0
        while True:
            time_elapsed = time.time() - prev
            ret, frame = cap.read()
            if not ret:
                break
            if time_elapsed > 1./frame_rate:
                prev = time.time()
                yield frame

    def process_frames(frames):
        for frame in frames:
            processed_frame = predict_and_detect(video_path, model, alert_threshold, frame, classes=[0])
            yield (b'--frame\r\n'
                   b'Content-Type: image/jpeg\r\n\r\n' + processed_frame + b'\r\n')

    return Response(process_frames(generate_frames()), mimetype='multipart/x-mixed-replace; boundary=frame')



@app.route('/get_stream_url', methods=['GET'])
def get_stream_url():
    return jsonify({'streamUrl': 'http://127.0.0.1:5000/process_video'})


# Socket debug
@socketio.on('connect')
def handle_connect():
    print('Client connected')

@socketio.on('disconnect')
def handle_disconnect():
    print('Client disconnected')

# Predicting functions
def predict(chosen_model, img, classes=[]):       
    results = chosen_model.predict(img, classes=classes, conf=CONFIDENCE_THRESHOLD)
    return results



def predict_and_detect(video_path, chosen_model, alert_threshold, img, classes=[0]):
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

    if person_count > alert_threshold and not alert_sent.get(video_path, False):
        alert_message = f"High density detected: {person_count} people."
        alerts.append(Alert(video_path, alert_message))
        socketio.emit('new_alert', {'video_path': video_path, 'alert_message': alert_message}, include_self=True)
        alert_sent[video_path] = True  # Set the flag to True after sending the alert

    _, buffer = cv2.imencode('.jpg', img)
    return buffer.tobytes()



if __name__ == "__main__":
    socketio.run(app, debug=False, port=5000)

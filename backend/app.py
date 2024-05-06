import cv2
from flask import Flask, Response, request, jsonify
from flask_cors import CORS
from ultralytics import YOLO

CONFIDENCE_THRESHOLD = 0.1
RECTANGLE_THICKNESS = 2
TEXT_THICKNESS = 1

app = Flask(__name__)
CORS(app)

model = YOLO('yolov9c.pt')

def predict(chosen_model, img, classes=[]):       
    results = chosen_model.predict(img, classes=classes, conf=CONFIDENCE_THRESHOLD)
    return results

def predict_and_detect(chosen_model, img, classes=[]):
    resized_img = cv2.resize(img, (640, 480)) 
    results = predict(chosen_model, resized_img, classes)
    for result in results:
        for box in result.boxes:
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
        while True:
            ret, frame = cap.read()
            if not ret:
                break
            processed_frame = predict_and_detect(model, frame, classes=[0])
            yield (b'--frame\r\n'
                   b'Content-Type: image/jpeg\r\n\r\n' + processed_frame + b'\r\n')

    return Response(generate(), mimetype='multipart/x-mixed-replace; boundary=frame')


@app.route('/get_stream_url', methods=['GET'])
def get_stream_url():
    return jsonify({'streamUrl': 'http://127.0.0.1:5000/process_video'})

if __name__ == "__main__":
    app.run(debug=True, port=5000)

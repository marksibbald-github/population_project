import cv2
from ultralytics import YOLO

def process_video(video_path):
    model = YOLO('yolov9c.pt')
    cap = cv2.VideoCapture(video_path)
    count = 0
    frame_skip = 5
    results = []

    while True:
        ret, img = cap.read()
        if not ret:
            break
        if count % frame_skip == 0:
            resized_img = cv2.resize(img, (640, 480))
            detections = model.predict(resized_img, classes=0, conf=0.1)
            count_persons = 0
            for det in detections:
                count_persons += len(det)
            results.append(count_persons)
        count += 1

    cap.release()
    return {"total_detections": results}

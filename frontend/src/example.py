import cv2
from ultralytics import YOLO

# Global configuration
CONFIDENCE_THRESHOLD = 0.1
RECTANGLE_THICKNESS = 2
TEXT_THICKNESS = 1

# Load the YOLO model
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
    return img, results

video_path = 'quiet.mp4'
cap = cv2.VideoCapture(video_path)

frame_skip = 5  
count = 0
while True:
    ret, img = cap.read()
    if not ret:
        break
    if count % frame_skip != 0:
        count += 1
        continue
    result_img, _ = predict_and_detect(model, img, classes=[0])
    cv2.imshow("YOLO Person Detection", result_img)
    count += 1
    if cv2.waitKey(1) & 0xFF == ord('q'):
        break

cap.release()
cv2.destroyAllWindows()
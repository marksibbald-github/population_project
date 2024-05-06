from flask import Flask, request, jsonify
from flask_cors import CORS
from video_processor import process_video

app = Flask(__name__)
CORS(app)  # Allow all origins for all routes

@app.route('/process_video', methods=['POST'])
def handle_process_video():
    video_path = request.json.get('videoPath', 'new.mp4')
    results = process_video(video_path)
    response = jsonify(results)
    response.headers.add('Access-Control-Allow-Origin', '*')
    return response

if __name__ == "__main__":
    app.run(debug=True, port=5000)

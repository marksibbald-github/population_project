import React, { useState } from "react";
import axios from "axios";
import { Button, Input, Segment } from "semantic-ui-react";

function App() {
  const [videoPath, setVideoPath] = useState("");
  const [streamUrl, setStreamUrl] = useState("");
  const [streaming, setStreaming] = useState(false);

  const fetchStreamUrl = async () => {
    try {
      const response = await axios.get("http://127.0.0.1:5000/get_stream_url");
      setStreamUrl(response.data.streamUrl);
      setStreaming(true);
    } catch (error) {
      console.error("Error fetching stream URL:", error);
      setStreaming(false);
    }
  };

  const handleProcessVideo = () => {
    fetchStreamUrl();
  };

  return (
    <div className="App">
      <Segment>
        <Input
          placeholder="Enter video path..."
          value={videoPath}
          onChange={(e) => setVideoPath(e.target.value)}
          style={{ width: "300px" }}
        />
        <Button onClick={handleProcessVideo} primary>
          Process Video
        </Button>
      </Segment>
      <Segment>
        {streaming && streamUrl && (
          <img
            src={`${streamUrl}?videoPath=${encodeURIComponent(videoPath)}`}
            alt="Video Stream"
            style={{ width: "400px" }}
          />
        )}
      </Segment>
    </div>
  );
}

export default App;

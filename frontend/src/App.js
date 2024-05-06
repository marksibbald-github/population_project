import React, { useState, useEffect } from "react";
import axios from "axios";
import { Button, Input, Segment } from "semantic-ui-react";
import io from "socket.io-client";

function App() {
  const [videoPath, setVideoPath] = useState("");
  const [streamUrl, setStreamUrl] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [alerts, setAlerts] = useState([]);

  useEffect(() => {
    const socket = io("http://127.0.0.1:5000", {
      transports: ["websocket"], // Force WebSocket usage
    });

    socket.on("connect", () => {
      console.log("Connected to WebSocket server!");
    });

    socket.on("new_alert", (alert) => {
      console.log("New alert received:", alert);
      setAlerts((prevAlerts) => [...prevAlerts, alert]);
    });

    return () => socket.disconnect();
  }, []);

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
        <div>
          {alerts.map((alert, index) => (
            <div key={index}>
              <p>
                <strong>Area:</strong> {alert.area_name}
              </p>
              <p>
                <strong>Message:</strong> {alert.alert_message}
              </p>
            </div>
          ))}
        </div>
      </Segment>
    </div>
  );
}

export default App;

import React, { useState, useEffect } from "react";
import axios from "axios";
import { Button, Segment, Dropdown } from "semantic-ui-react";
import io from "socket.io-client";

function App() {
  const [videoPath, setVideoPath] = useState("");
  const [streamUrl, setStreamUrl] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [alerts, setAlerts] = useState([]);
  const [videoList, setVideoList] = useState([]);
  const [selectedArea, setSelectedArea] = useState("");

  useEffect(() => {
    const socket = io("http://127.0.0.1:5000", {
      transports: ["websocket"],
    });

    socket.on("connect", () => console.log("Connected to WebSocket server!"));
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

  const fetchVideoList = async () => {
    try {
      const response = await axios.get("http://127.0.0.1:5000/list_videos");
      console.log("FETCH");
      setVideoList(response.data);
    } catch (error) {
      console.error("Error fetching video list:", error);
    }
  };

  const videoOptions = videoList.map((video) => ({
    key: video.file_name,
    text: video.name,
    value: video.file_name,
  }));

  const handleResetAlerts = () => {
    axios
      .post("http://127.0.0.1:5000/reset_alerts")
      .then((response) => {
        console.log(response.data);
        setAlerts([]);
      })
      .catch((error) => console.error("Error resetting all alerts:", error));
  };

  const handleChange = (e, { value }) => {
    const selectedVideo = videoList.find((video) => video.file_name === value);
    if (selectedVideo && videoPath !== `videos/${value}`) {
      setVideoPath(`videos/${value}`);
      setSelectedArea(selectedVideo.area);
      handleResetAlerts();
    }
  };

  return (
    <div className="App">
      <Segment>
        {/* handling fetch on dropdown open to try prevent intermitent cors issues */}
        <Dropdown
          placeholder="Select Video"
          fluid
          selection
          options={videoOptions}
          onChange={handleChange}
          onOpen={fetchVideoList}
        />
        <Button onClick={handleProcessVideo} primary>
          Process Video
        </Button>
      </Segment>
      <Segment>
        <h2>Selected Area: {selectedArea}</h2>
        {streaming && streamUrl && (
          <img
            src={`${streamUrl}?videoPath=${encodeURIComponent(videoPath)}`}
            alt="Video Stream"
            style={{ width: "800px" }}
          />
        )}
        <div>
          {console.log("AL", alerts)}
          {console.log("Vid", videoPath)}
          {alerts
            .filter((alert) => alert.video_path === videoPath)
            .map((alert, index) => (
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

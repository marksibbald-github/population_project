import React, { useState, useEffect } from "react";
import axios from "axios";
import { Segment } from "semantic-ui-react";
import "./App.css";
import io from "socket.io-client";
import VideoSelection from "./VideoSelection";
import VideoDisplay from "./VideoDisplay";
import ThresholdControl from "./ThresholdControl";
import AlertsDisplay from "./AlertsDisplay";

function App() {
  const [videoPath, setVideoPath] = useState("");
  const [streamUrl, setStreamUrl] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [alerts, setAlerts] = useState([]);
  const [videoList, setVideoList] = useState([]);
  const [selectedArea, setSelectedArea] = useState("");
  const [threshold, setThreshold] = useState(20);

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

  const handleThresholdChange = (e) => {
    const newThreshold = e.target.value;
    setThreshold(newThreshold);
  };

  useEffect(() => {
    const updateThreshold = async () => {
      try {
        const response = await axios.post(
          "http://127.0.0.1:5000/update_threshold",
          { threshold }
        );
        console.log("Threshold updated:", response.data);
      } catch (error) {
        console.error("Error updating threshold:", error);
      }
    };

    if (threshold !== "") {
      updateThreshold();
    }
  }, [threshold]);

  const fetchVideoList = async () => {
    axios
      .get("http://127.0.0.1:5000/list_videos", {
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      })
      .then((response) => {
        console.log(response.data);
        setVideoList(response.data);
      })
      .catch((error) => console.error("Error fetching video list:", error));
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
        <VideoSelection
          videoOptions={videoOptions}
          onVideoChange={handleChange}
          onProcessVideo={handleProcessVideo}
          onOpen={fetchVideoList}
        />
      </Segment>
      <Segment
        style={{ display: "flex", alignItems: "flex-start", height: "360px" }}
      >
        {" "}
        <div style={{ flex: "2" }}>
          <VideoDisplay
            selectedArea={selectedArea}
            streamUrl={streamUrl}
            videoPath={videoPath}
          />
        </div>
        <div
          style={{
            flex: "1",
            marginLeft: "20px",
            display: "flex",
            flexDirection: "column",
            height: "300px",
          }}
        >
          <div style={{ flex: "1", marginBottom: "20px" }}>
            <ThresholdControl
              threshold={threshold}
              onThresholdChange={handleThresholdChange}
            />
          </div>
          <div style={{ flex: "2" }}>
            <AlertsDisplay
              selectedArea={selectedArea}
              alerts={alerts}
              videoPath={videoPath}
            />
          </div>
        </div>
      </Segment>
    </div>
  );
}

export default App;

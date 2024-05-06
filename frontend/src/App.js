import React, { useState } from "react";
import axios from "axios";
import { Button, Input, Segment } from "semantic-ui-react";

function App() {
  const [videoPath, setVideoPath] = useState("");
  const [results, setResults] = useState(null);

  const handleProcessVideo = async () => {
    try {
      const response = await axios.post("http://127.0.0.1:5000/process_video", {
        videoPath,
      });
      setResults(response.data);
    } catch (error) {
      console.error("Error processing video:", error);
    }
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
        <pre>{JSON.stringify(results, null, 2)}</pre>
      </Segment>
    </div>
  );
}

export default App;

import React from "react";
import { Dropdown, Button } from "semantic-ui-react";

function VideoSelection({
  videoOptions,
  onVideoChange,
  onProcessVideo,
  onOpen,
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "space-between",
      }}
    >
      <Dropdown
        placeholder="Select Video"
        fluid
        selection
        options={videoOptions}
        onChange={onVideoChange}
        onOpen={onOpen}
        style={{ marginRight: "10px" }}
      />
      <Button
        onClick={onProcessVideo}
        primary
        style={{
          backgroundColor: "#1fa5de",
          width: "130px",
        }}
      >
        Scan Video
      </Button>
    </div>
  );
}

export default VideoSelection;

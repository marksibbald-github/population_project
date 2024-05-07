import React from "react";

function VideoDisplay({ selectedArea, streamUrl, videoPath }) {
  return (
    <div style={{ flex: 1 }}>
      <h2>{selectedArea}</h2>
      {streamUrl && (
        <img
          src={`${streamUrl}?videoPath=${encodeURIComponent(videoPath)}`}
          alt="Video Stream"
          style={{ width: "100%" }}
        />
      )}
    </div>
  );
}

export default VideoDisplay;

import React from "react";

function VideoDisplay({ streamUrl, videoPath }) {
  return (
    <div style={{ flex: 1 }}>
      {/* <h2>{selectedArea}</h2> */}
      {streamUrl ? (
        <img
          src={`${streamUrl}?videoPath=${encodeURIComponent(videoPath)}`}
          alt="Video Stream"
          style={{ width: "100%" }}
        />
      ) : (
        <div
          style={{
            width: "100%",
            height: "326.32px", // Hardcoded to match video A:R, will be more dynamic in production
            backgroundColor: "grey",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "white",
            fontSize: "20px",
          }}
        >
          <p>No video selected</p>
        </div>
      )}
    </div>
  );
}

export default VideoDisplay;

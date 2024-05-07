import React from "react";
import { Segment } from "semantic-ui-react";

function ThresholdControl({ threshold, onThresholdChange }) {
  return (
    <Segment>
      <input
        type="range"
        min="0"
        max="50"
        value={threshold}
        onChange={onThresholdChange}
        className="slider"
        style={{
          width: "100%",
          background: "#efe523",
          marginBottom: "30px",
        }}
      />

      <div>
        Send alert when there are more than <strong>{threshold}</strong> people
      </div>
    </Segment>
  );
}

export default ThresholdControl;

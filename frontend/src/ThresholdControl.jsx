import React from "react";
import { Button, Segment, Grid } from "semantic-ui-react";

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
          background: "#2f2d83",
          marginBottom: "30px",
        }}
      />

      <div>
        Send alert when there is more than <strong>{threshold}</strong> people
      </div>
    </Segment>
  );
}

export default ThresholdControl;

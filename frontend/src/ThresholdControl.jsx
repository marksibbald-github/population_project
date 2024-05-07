import React from "react";
import { Button, Segment } from "semantic-ui-react";

function ThresholdControl({ threshold, onThresholdChange, onUpdateThreshold }) {
  return (
    <Segment>
      <input
        type="range"
        min="0"
        max="50"
        value={threshold}
        onChange={onThresholdChange}
        className="slider"
      />
      <div className="slider-value">Threshold: {threshold}</div>
      <Button onClick={onUpdateThreshold} secondary>
        Update Threshold
      </Button>
    </Segment>
  );
}

export default ThresholdControl;

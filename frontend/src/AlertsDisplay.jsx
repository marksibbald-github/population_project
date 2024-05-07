import React from "react";
import { Segment, Icon } from "semantic-ui-react";

function AlertsDisplay({ alerts, videoPath, selectedArea }) {
  return (
    <Segment>
      {alerts
        .filter((alert) => alert.video_path === videoPath)
        .map((alert, index) => (
          <div key={index} style={{ marginBottom: "10px" }}>
            <h3 style={{ marginTop: 0, marginBottom: "10px" }}>
              {selectedArea}
            </h3>
            <div style={{ display: "flex", alignItems: "center" }}>
              <Icon
                name="warning circle"
                color="red"
                style={{ marginRight: "10px" }}
              />
              <p style={{ margin: 0 }}>{alert.alert_message}</p>
            </div>
          </div>
        ))}
    </Segment>
  );
}

export default AlertsDisplay;

import React from "react";
import { Segment, Icon } from "semantic-ui-react";

function AlertsDisplay({ alerts, videoPath, selectedArea }) {
  return (
    <Segment style={{ height: "190px", overflowY: "auto" }}>
      <h3>{selectedArea ? selectedArea : "Alerts Dialog"}</h3>
      {alerts.filter((alert) => alert.video_path === videoPath).length > 0 ? (
        alerts
          .filter((alert) => alert.video_path === videoPath)
          .map((alert, index) => (
            <div key={index} style={{ marginBottom: "10px" }}>
              <div style={{ display: "flex", alignItems: "center" }}>
                <Icon
                  name="warning circle"
                  color="red"
                  style={{ marginRight: "10px" }}
                />
                <p style={{ margin: 0 }}>{alert.alert_message}</p>
              </div>
            </div>
          ))
      ) : (
        <div
          style={{ display: "flex", alignItems: "center", marginTop: "20px" }}
        >
          <Icon
            name="info circle"
            color="blue"
            style={{ marginRight: "10px" }}
          />
          <p>
            Alerts will show here if the video shows more than your specified
            amount above.
          </p>
        </div>
      )}
    </Segment>
  );
}

export default AlertsDisplay;

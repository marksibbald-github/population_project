import React from "react";
import { Segment } from "semantic-ui-react";

function AlertsDisplay({ alerts, videoPath }) {
  return (
    <Segment>
      {alerts
        .filter((alert) => alert.video_path === videoPath)
        .map((alert, index) => (
          <div key={index}>
            <p>
              <strong>Area:</strong> {alert.area_name}
            </p>
            <p>
              <strong>Message:</strong> {alert.alert_message}
            </p>
          </div>
        ))}
    </Segment>
  );
}

export default AlertsDisplay;

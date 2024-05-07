# Over-populated camera application

- Please note, that I am going to continue with some CSS and small bug fixes this coming evening, but the main functionality will remain.

## What it does

- The main idea behind that app is to alert internal staff when a certain area is becoming too busy, for example in an event, whether a certain point on CCTV is a safety concern, or if extra staff are needed to accommodate the increase in numbers.
- In the dashboard, there is a video selection process, this allows you to choose from 2 videos, one slightly busier than the other. You should see an overlay counting how many people there are during each frame.
- In production, this would be a series of live CCTV cameras.
- Within this dashboard, there is a slider, this allows you to set the number of people that would be required at one time to set off the alert. This is saved when you change it, and the value is sent to the yolov9 ML model.
- If at any point the scan detects a higher value that what you have set as your people threshold in the step before, there will be an alert sent to the UI via a websocket.

## Main components

- Flask API that runs the yolov9 model.
- React front end that has a container, video selection, video display, people threshold slider, and an alert dialog.
- The React front-end utilises semantic UI React components.
- Websocket to allow for alerts to be sent during the streaming process.

## To run

- Clone the repo

### Backend

- CD into backend and create a python venv 'Python3 -m venv venv'
- Activate the venv with 'source venv/bin/activate'
- Within this venv run 'pip install -r requirements.txt' to download the required files
- Start the server with 'flask run'

### Frontend

- For the front end, in another terminal window cd into the 'frontend', and run npm install, followed by npm start.

- With both of these running, the app should start.

## Points worth noting

- As this is running an ML model, it is resource-heavy, and can result in the video running slowly, this would be fine-tuned in further versions.
- Memory is saved within each session. I would ideally like to integrate AWS and Node.js Lambdas to allow for persistant storage in a later version.
- And as mentioned initially, this is a bit rough in its current state, but I will have it in a better shape for tomorrow's demo.
- And finally, apologies for the Python-heavy set-up. If this is something that you do not use frequently/ do not have installed, it may be easier to view this directly in the demo. Having this hosted on the web or run in a container would be a better solution.

import time
from flask import Flask
from flask_cors import CORS

app = Flask(__name__)
CORS(app) #comment this on deployment

@app.route('/time')
def get_current_time():
    return {"resultStatus": "SUCCESS", 'time': time.time()}
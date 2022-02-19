import time
import threading
import json

from flask import Flask, request, Response
from flask_cors import CORS

from backend.preprocess import pipeline
from backend import submit_job
from backend.inference import inference
import maps

app = Flask(__name__)
CORS(app)


class ProgressThread(threading.Thread):

  def __init__(self, state, f):
    self.state = state
    self.f = f
    self.completed = False
    super().__init__()

  def run(self):
    # Your exporting stuff goes here ...
    self.state = self.f()
    self.completed = True


class JobHandler:

  def __init__(self):
    self.jobs = dict()

  def add_job(self, id):
    self.jobs[id] = {
        "status": "STARTED",
        "object": None,
        "tasks": None,
        "thread": None
    }

  def download_data(self, id, image, output, trainPoly, testPolys):
    if id not in self.jobs:
      raise ValueError("Job does not exist")
    elif self.jobs[id]["status"] != "STARTED":
      raise ValueError("Download has already happened or currently running")
    else:
      job = pipeline.EarthBoardProcessJob(image, output)
      job.set_geometries(trainPoly, testPolys)
      tasks = job.move_data()  #FIXED FOR NOW
      self.jobs[id]["status"] = "DOWNLOADING"
      self.jobs[id]["object"] = job
      self.jobs[id]["tasks"] = tasks

  def run_model(self, id):
    if id not in self.jobs:
      raise ValueError("Job does not exist")
    if self.jobs[id] != "DOWNLOADED":
      raise ValueError("Need to wait for Download")
    job = submit_job.run_job()
    self.jobs["status"] = "TRAINING"
    self.jobs["object"] = job
    self.jobs["task"] = job

  def inference(self, id, image):
    if id not in self.jobs:
      raise ValueError("Job does not exist")
    if self.jobs[id] != "TRAINED":
      raise ValueError("Need to wait for Download")
    predictions = inference.deploy_to_inference(id, image)
    self.jobs["status"] = "DONE"
    self.jobs["object"] = predictions
    self.tasks["task"] = None

  def visualize(self, id):
    if self.jobs[id]["status"] not in self.jobs \
            or self.jobs[id]["status"] != "DONE":
      raise ValueError("Does not exist or in wrong state")
    image = self.jobs["id"]["object"]
    visParams = {{'min': 0, 'max': 1}}
    return image.getMapId(visParams)['tile_fetcher'].url_format

  def update_status(self, id):
    if id not in self.jobs:
      raise ValueError("Job does not exist")
    if self.jobs[id]["status"] == "DOWNLOADING":
      for task in self.jobs[id]["tasks"]:
        if task.status() == "FAILED":
          self.jobs[id]["status"] = "FAILED"
          return True
        if task.status() != "COMPLETED":
          return False
      self.jobs[id]["status"] = 'DOWNLOADED'
      return True
    if self.jobs[id]["status"] == "TRAINING":
      if submit_job.get_job_state(self.jobs["id"]["task"]) == "SUCCEDED":
        self.jobs[id]["status"] == "TRAINED"
        return True
      return False

  def create_poll(self, id):
    if self.jobs[id]["thread"] is not None:
      return

    def f():
      while not self.update_status(id):
        yield self.jobs[id]["status"]
        time.sleep(30)

    self.jobs[id]["thread"] = ProgressThread(state=self.jobs[id]["status"], f=f)
    self.jobs[id]["thread"].start()


jobHandler = JobHandler()


@app.route('/create')
def create_job():
  data = request.get_json()
  dataValues = json.loads(data)
  try:
    jobHandler.add_job(dataValues["id"])
  except Exception as e:
    return {"MESSAGE": str(e)}
  return {"MESSAGE": "SUCCESS"}


@app.route('/process')
def process_data():
  data = request.get_json()
  dataValues = json.loads(data)
  try:
    jobHandler.download_data(dataValues["id"], dataValues["image"],
                             dataValues["output"], dataValues["trainPoly"],
                             dataValues["evalPoly"])
  except Exception as e:
    return {"MESSAGE": str(e)}
  jobHandler.create_poll(id=dataValues["id"])
  return {"MESSAGE": "SUCCESS"}


@app.route('/model')
def model():
  data = request.get_json()
  dataValues = json.loads(data)
  try:
    jobHandler.run_model(dataValues["id"])
    jobHandler.create_poll(id=dataValues["id"])
  except Exception as e:
    return {"MESSAGE": str(e)}
  return {"MESSAGE": "SUCCESS"}


@app.route('/inference')
def inference():
  data = request.get_json()
  dataValues = json.loads(data)
  try:
    jobHandler.inference(dataValues["id"], dataValues["image"])
  except Exception as e:
    return {"MESSAGE": str(e)}
  return {"MESSAGE": "SUCCESS"}


@app.route('/visualize')
def visualize_predictions():
  data = request.get_json()
  dataValues = json.loads(data)
  try:
    jobHandler.visualize(dataValues["id"])
  except Exception as e:
    return {"MESSAGE": str(e)}
  return {"MESSAGE": "SUCCESS"}


@app.route('/poll')
def poll_status():
  data = request.get_json()
  dataValues = json.loads(data)

  def stream(id):
    while not jobHandler.jobs[id]["thread"].completed:
      time.sleep(30)
      return jobHandler.jobs[id]["status"]

  return Response(stream(dataValues["id"]), mimetype="text/event-stream")


@app.route('/map')
def render_map():
  data = request.get_json()
  dataValues = json.loads(data)
  try:
    maps.get_ee_layer(dataValues["ic"], dataValues["reducer"],
                      dataValues["start"], dataValues["end"],
                      dataValues["visParams"])
  except Exception as e:
    return {"MESSAGE": str(e)}
  return {"MESSAGE": "SUCCESS"}

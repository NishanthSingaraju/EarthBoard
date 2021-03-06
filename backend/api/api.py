import time
import threading
import json

from flask import Flask, request, Response
from flask_cors import CORS, cross_origin

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
      raise ValueError(f"Job does not exist {id}")
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
        print(task.status())
        if task.status()["state"] == "FAILED":
          self.jobs[id]["status"] = "FAILED"
          return True
        if task.status()["state"] != "COMPLETED":
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
        time.sleep(10)

    self.jobs[id]["thread"] = ProgressThread(state=self.jobs[id]["status"], f=f)
    self.jobs[id]["thread"].start()
    print("Created Thread")


jobHandler = JobHandler()
jobHandler.add_job("testJob")


@app.route('/test', methods=["PUT"])
def test():
  return {"MESSAGE": "SUCCESS"}


@app.route('/create', methods=["PUT"])
def create_job():
  dataValues = request.get_json()
  try:
    jobHandler.add_job(dataValues["id"])
  except Exception as e:
    return {"MESSAGE": str(e)}
  return {"MESSAGE": "SUCCESS"}


@app.route('/process', methods=["PUT"])
def process_data():
  dataValues = request.get_json()
  try:
    jobHandler.download_data(dataValues["id"], dataValues["image"],
                             dataValues["output"], dataValues["trainPoly"],
                             dataValues["evalPoly"])
  except Exception as e:
    return {"MESSAGE": str(e)}
  jobHandler.create_poll(id=dataValues["id"])
  return {"MESSAGE": "SUCCESS"}


@app.route('/model', methods=["PUT"])
def model():
  data = request.get_json()
  dataValues = json.loads(data)
  try:
    jobHandler.run_model(dataValues["id"])
    jobHandler.create_poll(id=dataValues["id"])
  except Exception as e:
    return {"MESSAGE": str(e)}
  return {"MESSAGE": "SUCCESS"}


@app.route('/inference', methods=["PUT"])
def inference():
  data = request.get_json()
  dataValues = json.loads(data)
  try:
    jobHandler.inference(dataValues["id"], dataValues["image"])
  except Exception as e:
    return {"MESSAGE": str(e)}
  return {"MESSAGE": "SUCCESS"}


@app.route('/visualize', methods=["PUT"])
def visualize_predictions():
  data = request.get_json()
  dataValues = json.loads(data)
  try:
    jobHandler.visualize(dataValues["id"])
  except Exception as e:
    return {"MESSAGE": str(e)}
  return {"MESSAGE": "SUCCESS"}

@app.route('/api/tasks', methods=["PUT"])
def get_task_names():
  data = request.get_json()
  ans = dict()
  ans["tasks"] = []
  for task in jobHandler.jobs[data["id"]]["tasks"]:
    ans["tasks"].append(task.status())
  return ans

@app.route('/api/poll')
def poll_status():

  def stream(id):
    status = jobHandler.jobs[id]["status"]
    while jobHandler.jobs[id]["thread"].completed:
      status = jobHandler.jobs[id]["status"]
      yield f"data: {status}\n\n"
      time.sleep(10)
    yield f"data: {status}\n\n"
  return Response(stream("testJob"), mimetype="text/event-stream")


@app.route('/api/map', methods=["PUT"])
def render_map():
  dataValues = request.get_json()
  vizParams = json.loads(dataValues["vizParams"])
  try:
    url = maps.get_ee_layer(dataValues["ic"], dataValues["reducer"],
                            dataValues["start"], dataValues["end"], vizParams)
  except Exception as e:
    return {"MESSAGE": str(e)}
  return {"url": url}

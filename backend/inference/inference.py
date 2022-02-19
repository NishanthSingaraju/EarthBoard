import json
import subprocess
import os
import time

import ee
from tensorflow.python.tools import saved_model_utils

from backend.aiplatform import config

JOB_DIR = 'gs://' + config.BUCKET + '/' + config.FOLDER + '/trainer'
EE_DIR = os.path.join(JOB_DIR + "/earthengine")


def convert_model_to_ee():
  meta_graph_def = saved_model_utils.get_meta_graph_def(config.MODEL_DIR,
                                                        'serve')
  inputs = meta_graph_def.signature_def['serving_default'].inputs
  outputs = meta_graph_def.signature_def['serving_default'].outputs

  input_name = None
  for k, v in inputs.items():
    input_name = v.name
    break

  output_name = None
  for k, v in outputs.items():
    output_name = v.name
    break

  input_dict = "'" + json.dumps({input_name: "array"}) + "'"
  output_dict = "'" + json.dumps({output_name: "output"}) + "'"

  p = subprocess.run(["earthengine", "set", "project", config.PROJECT])
  p = subprocess.run([
      "earthengine", "model", "prepare", "--source_dir", config.MODEL_DIR,
      "--dest_dir", EE_DIR, "--input", input_dict, "--output", output_dict
  ])

  return "SUCCESS"


def deploy_model(id):
  model_name = f"model_{id}"
  version = 'v' + str(int(time.time()))
  subprocess.run([
      "gcloud", "ai-platform", "models", "create", model_name, "--project",
      config.PROJECT, "--region", config.REGION
  ])
  subprocess.run([
      "gcloud", "ai-platform", "versions", "create", version, "--project",
      config.PROJECT, "--model", model_name, "--region", config.REGION,
      "--origin", EE_DIR, "--framework", "TENSORFLOW", "--runtime-version",
      str(2.3), "--python-version",
      str(3.7), "--config", "config.yaml"
  ])
  return model_name, version


def inference(model_name, version, image):
  image = ee.Image(image)
  model = ee.Model.fromAiPlatformPredictor(
      projectName=config.PROJECT,
      modelName=model_name,
      version=version,
      inputTileSize=[144, 144],
      inputOverlapSize=[8, 8],
      proj=ee.Projection('EPSG:4326').atScale(30),
      fixInputProj=True,
      outputBands={'impervious': {
          'type': ee.PixelType.float()
      }})
  predictions = model.predictImage(image.toArray())
  return predictions


def deploy_to_inference(id, image):
  convert_model_to_ee()
  model_name, version = deploy_model(id)
  predictions = inference(model_name, version, image)
  return predictions

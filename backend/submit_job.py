import time
import subprocess
import re

from backend.aiplatform import config

JOB_NAME = 'training_job_'
TRAINER_PACKAGE_PATH = 'aiplatform'
MAIN_TRAINER_MODULE = 'aiplatform.task'
JOB_DIR = 'gs://' + config.BUCKET + '/' + config.FOLDER + '/trainer'
SCALE = "basic-gpu"


def run_job():
  job = JOB_NAME + str(int(time.time()))
  p = subprocess.run([
      "gcloud", "ai-platform", "jobs", "submit", "training", job, "--job-dir",
      JOB_DIR, "--package-path", TRAINER_PACKAGE_PATH, "--module-name",
      MAIN_TRAINER_MODULE, "--region", config.REGION, "--project",
      config.PROJECT, "--runtime-version",
      str(2.3), "--python-version",
      str(3.7), "--scale-tier", SCALE
  ])

  return job


def get_job_state(job):
  p = subprocess.run(["gcloud", "ai-platform", "jobs", "describe", job],
                     stdout=subprocess.PIPE)
  desc = p.stdout.decode("utf-8")
  state = re.search("state:.*\n", desc).group(0).split(":")[1].strip()
  return state


if __name__ == '__main__':
  print(get_job_state("training_job_1645247068"))

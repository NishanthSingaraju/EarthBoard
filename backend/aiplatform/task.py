from . import example_model
from . import model_template

if __name__ == '__main__':
  model_template.EarthBoardTrainJob(get_model=example_model.get_model)
  model_template.run_model()

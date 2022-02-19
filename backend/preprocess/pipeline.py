import ee
from backend.aiplatform import config

class EarthBoardProcessJob:
  def __init__(self, image, output):
    self.image = image
    self.output = output
    self.trainPolys = None
    self.evalPolys = None

  def set_geometries(self, trainPoly=None, evalPoly=None):
    self.trainPolys = ee.FeatureCollection(
        'projects/google/DemoTrainingGeometries')
    self.evalPolys = ee.FeatureCollection('projects/google/DemoEvalGeometries')

  def move_data(self, sample_size, shards):
    image, output = ee.Image(self.image), ee.Image(self.output)
    featureStack = ee.Image.cat(
        [image.select(config.BANDS),
         output.select(config.RESPONSE)]).float()

    l = ee.List.repeat(1, config.KERNEL_SIZE)
    lists = ee.List.repeat(l, config.KERNEL_SIZE)
    kernel = ee.Kernel.fixed(config.KERNEL_SIZE, config.KERNEL_SIZE, lists)
    arrays = featureStack.neighborhoodToArray(kernel)
    trainingPolys = self.trainPolys
    evalPolys = self.evalPolys
    trainingPolysList = trainingPolys.toList(trainingPolys.size())
    evalPolysList = evalPolys.toList(evalPolys.size())

    for g in range(trainingPolys.size().getInfo()):
      geomSample = ee.FeatureCollection([])
      for i in range(shards):
        sample = arrays.sample(region=ee.Feature(
            trainingPolysList.get(g)).geometry(),
                               scale=config.SCALE,
                               numPixels=sample_size / shards,
                               seed=i,
                               tileScale=8)
        geomSample = geomSample.merge(sample)

      desc = config.TRAINING_BASE + '_g' + str(g)
      task = ee.batch.Export.table.toCloudStorage(
          collection=geomSample,
          description=desc,
          bucket=config.BUCKET,
          fileNamePrefix=config.FOLDER + '/' + desc,
          fileFormat='TFRecord',
          selectors=config.BANDS + [config.RESPONSE])
      task.start()

    # Export all the evaluation data.
    for g in range(evalPolys.size().getInfo()):
      geomSample = ee.FeatureCollection([])
      for i in range(shards):
        sample = arrays.sample(region=ee.Feature(
            evalPolysList.get(g)).geometry(),
                               scale=config.SCALE,
                               numPixels=sample_size / shards,
                               seed=i,
                               tileScale=8)
        geomSample = geomSample.merge(sample)

      desc = config.EVAL_BASE + '_g' + str(g)
      task = ee.batch.Export.table.toCloudStorage(
          collection=geomSample,
          description=desc,
          bucket=config.BUCKET,
          fileNamePrefix=config.FOLDER + '/' + desc,
          fileFormat='TFRecord',
          selectors=config.BANDS + [config.RESPONSE])
      task.start()
    return "SUCCESS"




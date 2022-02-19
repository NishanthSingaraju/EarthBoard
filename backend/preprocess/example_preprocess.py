import ee

ee.Initialize()

def cloud_mask(image):
  opticalBands = ['B1', 'B2', 'B3', 'B4', 'B5', 'B6', 'B7']
  thermalBands = ['B10', 'B11']
  cloudShadowBitMask = ee.Number(2).pow(3).int()
  cloudsBitMask = ee.Number(2).pow(5).int()
  qa = image.select('pixel_qa')
  mask1 = qa.bitwiseAnd(cloudShadowBitMask).eq(0).And(
      qa.bitwiseAnd(cloudsBitMask).eq(0))
  mask2 = image.mask().reduce('min')
  mask3 = image.select(opticalBands).gt(0).And(
      image.select(opticalBands).lt(10000)).reduce('min')
  mask = mask1.And(mask2).And(mask3)
  return image.select(opticalBands).divide(10000).addBands(
      image.select(thermalBands).divide(10).clamp(
          273.15, 373.15).subtract(273.15).divide(100)).updateMask(mask)


def preprocess():
  l8sr = ee.ImageCollection('LANDSAT/LC08/C01/T1_SR')
  image = l8sr.filterDate('2015-01-01', '2017-12-31').map(cloud_mask).median()
  nlcd = ee.Image('USGS/NLCD/NLCD2016').select('impervious')
  output = nlcd.divide(100).float()
  return image, output

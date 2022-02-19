function cloud_mask(image){
  var opticalBands = ['B1', 'B2', 'B3', 'B4', 'B5', 'B6', 'B7']
  var thermalBands = ['B10', 'B11']
  var cloudShadowBitMask = ee.Number(2).pow(3).int()
  var cloudsBitMask = ee.Number(2).pow(5).int()
  var qa = image.select('pixel_qa')
  var mask1 = qa.bitwiseAnd(cloudShadowBitMask).eq(0).and(
        qa.bitwiseAnd(cloudsBitMask).eq(0))
  var mask2 = image.mask().reduce('min')
  var mask3 = image.select(opticalBands).gt(0).and(
        image.select(opticalBands).lt(10000)).reduce('min')
  var mask = mask1.and(mask2).and(mask3)
    return image.select(opticalBands).divide(10000).addBands(
        image.select(thermalBands).divide(10).clamp(
            273.15, 373.15).subtract(273.15).divide(100)).updateMask(mask)
};

var l8sr = ee.ImageCollection('LANDSAT/LC08/C01/T1_SR')
var image = l8sr.filterDate('2015-01-01', '2017-12-31').map(cloud_mask).median()
var nlcd = ee.Image('USGS/NLCD/NLCD2016').select('impervious')
var output = nlcd.divide(100).float()

Export.image.toAsset({
  "image": image,
  "description": "CloudLandsat",
  "assetId": "users/nishanthsingaraju/cloud",
  "scale": 30,
  "maxPixels": 10e11
});

Export.image.toAsset({
  "image": output,
  "description": "impervious",
  "assetId": "users/nishanthsingaraju/impervious",
  "scale": 30,
  "maxPixels": 10e11
});

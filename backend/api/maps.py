import ee

ee.Initialize()

def get_ee_layer(ic, reducer, start, end, visParams):
    bands = ["temperature_2m_above_ground"]
    ic =  ee.ImageCollection(ic).select(bands)
    ic = ic.filterDate(start, end)
    if reducer == "mean":
        image = ic.mean()
    else:
        image = ic.first()
    return image.getMapId(visParams)['tile_fetcher'].url_format

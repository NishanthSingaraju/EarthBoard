import tensorflow as tf

PROJECT = "dataflow-test-313806"
BUCKET = 'earthboard'
REGION = 'us-central1'
FOLDER = 'fcnn'
TRAINING_BASE = 'training_patches'
EVAL_BASE = 'eval_patches'

# Specify inputs (Landsat bands) to the model and the response variable.
# BANDS = ['B1', 'B2', 'B3', 'B4', 'B5', 'B6', 'B7', "B10", "B11"]
# RESPONSE = 'impervious'
BANDS = ["b1"]
RESPONSE = "treecover2000"
FEATURES = BANDS + [RESPONSE]

# Specify the size and shape of patches expected by the model.
KERNEL_SIZE = 256
KERNEL_SHAPE = [KERNEL_SIZE, KERNEL_SIZE]
COLUMNS = [
    tf.io.FixedLenFeature(shape=KERNEL_SHAPE, dtype=tf.float32)
    for k in FEATURES
]
FEATURES_DICT = dict(zip(FEATURES, COLUMNS))

# Sizes of the training and evaluation datasets.
TRAIN_SIZE = 16000
EVAL_SIZE = 8000

# Specify model training parameters.
BATCH_SIZE = 16
EPOCHS = 10
BUFFER_SIZE = 2000
SCALE = 90

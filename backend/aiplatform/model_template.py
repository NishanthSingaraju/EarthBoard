import tensorflow as tf

import config
import example_model


def parse_tfrecord(example_proto):
  return tf.io.parse_single_example(example_proto, config.FEATURES_DICT)


def to_tuple(inputs):
  inputsList = [inputs.get(key) for key in config.FEATURES]
  stacked = tf.stack(inputsList, axis=0)
  # Convert from CHW to HWC
  stacked = tf.transpose(stacked, [1, 2, 0])
  return stacked[:, :, :len(config.BANDS)], stacked[:, :, len(config.BANDS):]


def get_dataset(pattern):
  glob = tf.io.gfile.glob(pattern)
  dataset = tf.data.TFRecordDataset(glob, compression_type='GZIP')
  dataset = dataset.map(parse_tfrecord, num_parallel_calls=5)
  dataset = dataset.map(to_tuple, num_parallel_calls=5)
  return dataset

class EarthBoardTrainJob:

    def __init__(self, get_model):
        self.get_model = get_model

    def load_train(self):
        glob = 'gs://' + config.BUCKET + '/' + config.FOLDER + '/' + config.TRAINING_BASE + '*'
        dataset = get_dataset(glob)
        dataset = dataset.shuffle(config.BUFFER_SIZE).batch(
            config.BATCH_SIZE).repeat()
        return dataset


    def load_eval(self):
        glob = 'gs://' + config.BUCKET + '/' + config.FOLDER + '/' + config.EVAL_BASE + '*'
        dataset = get_dataset(glob)
        dataset = dataset.batch(1).repeat()
        return dataset


    def run_model(self):
        training = self.load_train()
        evaluation = self.load_eval()
        m = self.get_model()
        m.fit(x=training,
              epochs=config.EPOCHS,
              steps_per_epoch=int(config.TRAIN_SIZE / config.BATCH_SIZE),
              validation_data=evaluation,
              validation_steps=config.EVAL_SIZE)
        m.save(config.MODEL_DIR, save_format='tf')
        return "SUCCESS"

if __name__ == "__main__":
    job = EarthBoardTrainJob(get_model=example_model.get_model)
    job.run_model()



import mongoose from 'mongoose';

const TopicEnSchema = new mongoose.Schema({
  _id: {
    type: String,
  },
  name: {
    type: String,
    required: true
  },
}, {
  timestamps: true,
});

TopicEnSchema.statics.findForElastic = function ({
  batchSize = 1000,
  page = 0,
}) {
  return this.find({}, {
    __v: 0
  }).skip(page * batchSize).limit(batchSize);
}

export default mongoose.model('TopicEn', TopicEnSchema, 'topics_en');
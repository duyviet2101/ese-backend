import mongoose from 'mongoose';

const TopicViSchema = new mongoose.Schema({
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

TopicViSchema.statics.findForElastic = function ({
  batchSize = 1000,
  page = 0,
}) {
  return this.find({}, {
    __v: 0
  }).skip(page * batchSize).limit(batchSize);
}

export default mongoose.model('TopicVi', TopicViSchema, 'topics_vi');
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

export default mongoose.model('TopicVi', TopicViSchema, 'topics_vi');
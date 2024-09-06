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

export default mongoose.model('TopicEn', TopicEnSchema, 'topics_en');
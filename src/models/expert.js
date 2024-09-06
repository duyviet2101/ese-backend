import mongoose from 'mongoose';
import mongooseAutoPopulate from 'mongoose-autopopulate';

const ExpertSchema = new mongoose.Schema({
  other_link: {
    type: String,
  },
  address: {
    type: String,
  },
  gender: {
    type: Number,
  },
  degree: {
    type: String,
    required: true
  },
  score: {
    type: Number,
    default: 0,
    required: true
  },
  birth: {
    type: String,
  },
  phone: {
    type: String,
  },
  name: {
    type: String,
    required: true
  },
  company: {
    type: String,
    required: true
  },
  location: {
    type: Object,
    required: true,
    _id: false,
  },
  email: {
    type: String,
    required: true
  },
  link_profile: {
    type: String,
    required: true
  },
  img: {
    type: String,
    default: null,
    // required: true
  },
  rank_experts: {
    type: Number,
    default: 1,
  },
  research_area: {
    type: [
      {
        type: String,
        ref: 'TopicVi',
        autopopulate: true

      }
    ],
    default: [],
  },
  research_area_en: {
    type: [
      {
        type: String,
        ref: 'TopicEn',
        autopopulate: true

      }
    ],
    default: [],
  },
}, {
  timestamps: true
});

ExpertSchema.plugin(mongooseAutoPopulate);

ExpertSchema.statics.findForElastic = function ({
  batchSize = 1000,
  page = 0,
}) {
  return this.find({}, {
    __v: 0
  }).skip(page * batchSize).limit(batchSize);
}

const Expert = mongoose.model('Expert', ExpertSchema, 'experts');

export default Expert;
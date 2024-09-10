import mongoose from 'mongoose';
import mongooseAutoPopulate from 'mongoose-autopopulate';

const BookSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true
  },
  title: {
    type: String,
    required: true
  },
  year: {
    type: String,
  },
  role: {
    type: String,
  },
  publisher: {
    type: String,
  },
}, {
  _id: false
});

const ResearchSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true
  },
  title: {
    type: String,
    required: true
  },
  year: {
    type: String,
  },
  role: {
    type: String,
  },
  level: {
    type: String,
  },
  status: {
    type: String,
  },
}, {
  _id: false
});

const ArticleSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true
  },
  title: {
    type: String,
    required: true
  },
  published_in: {
    type: String,
  },
  role: {
    type: String,
  },
  year: {
    type: String,
  },
  type: {
    type: String,
  },
}, {
  _id: false
});

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
  book_written: {
    type: [BookSchema],
    default: [],
  },
  researches: {
    type: [ResearchSchema],
    default: [],
  },
  articles: {
    type: [ArticleSchema],
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

const Expert = mongoose.model('Expert', ExpertSchema, 'sdh_crawl');

export default Expert;
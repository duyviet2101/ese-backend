import mongoose from 'mongoose';
import mongooseAutoPopulate from 'mongoose-autopopulate';

const CommitteeSchema = new mongoose.Schema({
  expert: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Expert',
    autopopulate: true,
  },
  contact_status: {
    type: String,
    required: true,
    default: 'not_contacted',
  },
}, {
  _id: false
});

const thesisSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  degree: {
    type: String,
    required: true,
    trim: true
  },
  research_area: {
    type: [{
      type: String,
      ref: 'TopicVi',
      autopopulate: true,
    }],
    required: true,
  },
  defense_date: {
    type: Date,
    required: true
  },
  candidate: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Candidate',
    autopopulate: true,
    required: true
  },
  committees: {
    type: [CommitteeSchema],
    required: true,
    default: []
  },
  // advisor: {
  //   type: mongoose.Schema.Types.ObjectId,
  //   ref: 'Experts',
  //   autopopulate: true,
  //   required: true
  // },
  status: {
    type: String,
    required: true,
    default: 'not_started',
  }
}, {
  timestamps: true
});

thesisSchema.plugin(mongooseAutoPopulate);

const Thesis = mongoose.model('Thesis', thesisSchema);

export default Thesis;
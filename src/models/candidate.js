import mongoose from 'mongoose';

const candidateSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    trim: true
  },
  phone: {
    type: String,
    required: true,
    trim: true
  },
  birth: {
    type: Date,
    required: true
  },
  gender: {
    type: Number,
    required: true
  },
  company: {
    type: String,
    required: true
  },
  school: {
    type: String,
    required: true
  },
  major: {
    type: String,
    required: true
  },
}, {
  timestamps: true
});

const Candidate = mongoose.model('Candidate', candidateSchema);

export default Candidate;
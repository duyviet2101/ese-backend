import mongoose from 'mongoose';
import mongooseAutoPopulate from 'mongoose-autopopulate';
import { COMMITTEE_ROLES, COMMITTEE_STATUSES, CONTACT_STATUSES } from '../constants/committee.js';
import { THESIS_DEGREES } from '../constants/thesis.js';

const CommitteeSchema = new mongoose.Schema({
  expert: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Expert',
    autopopulate: true,
  },
  contact_status: {
    type: String,
    required: true,
    default: CONTACT_STATUSES.NOT_CONTACTED.value,
  },
  role: {
    type: String,
    required: true,
  }
}, {
  _id: false
});

const RolesStructureSchema = new mongoose.Schema({
  [COMMITTEE_ROLES.CHAIR.value]: {
    type: Number,
    required: true,
    default: COMMITTEE_ROLES.CHAIR.defaultCount,
  },
  [COMMITTEE_ROLES.SECRETARY.value]: {
    type: Number,
    required: true,
    default: COMMITTEE_ROLES.SECRETARY.defaultCount,
  },
  [COMMITTEE_ROLES.REVIEWER.value]: {
    type: Number,
    required: true,
    default: COMMITTEE_ROLES.REVIEWER.defaultCount,
  }
}, {
  _id: false
});

const CommitteesSchema = new mongoose.Schema({
  roles_structure: {
    type: RolesStructureSchema,
    required: true,
    default: {
      [COMMITTEE_ROLES.CHAIR.value]: COMMITTEE_ROLES.CHAIR.defaultCount,
      [COMMITTEE_ROLES.SECRETARY.value]: COMMITTEE_ROLES.SECRETARY.defaultCount,
      [COMMITTEE_ROLES.REVIEWER.value]: COMMITTEE_ROLES.REVIEWER.defaultCount,
    }
  },
  waiting_list: {
    type: [CommitteeSchema],
    default: []
  },
  approved_list: {
    type: [CommitteeSchema],
    default: []
  },
  rejected_list: {
    type: [CommitteeSchema],
    default: []
  },
  status: {
    type: String,
    required: true,
    default: COMMITTEE_STATUSES.not_started.value,
  }
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
    trim: true,
    enum: [THESIS_DEGREES.TS.value, THESIS_DEGREES.ThS.value, THESIS_DEGREES.CN.value],
  },
  research_area: {
    type: [{
      type: String,
      ref: 'TopicVi',
      autopopulate: true,
    }],
    required: true,
  },
  keywords: {
    type: [String],
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
    type: CommitteesSchema,
    required: true,
    default: {
      roles_structure: {
        [COMMITTEE_ROLES.CHAIR.value]: COMMITTEE_ROLES.CHAIR.defaultCount,
        [COMMITTEE_ROLES.SECRETARY.value]: COMMITTEE_ROLES.SECRETARY.defaultCount,
        [COMMITTEE_ROLES.REVIEWER.value]: COMMITTEE_ROLES.REVIEWER.defaultCount,
      },
      waiting_list: [],
      approved_list: [],
      rejected_list: [],
      status: COMMITTEE_STATUSES.not_started.value,
    }
  }
}, {
  timestamps: true
});

thesisSchema.plugin(mongooseAutoPopulate);

const Thesis = mongoose.model('Thesis', thesisSchema);

export default Thesis;
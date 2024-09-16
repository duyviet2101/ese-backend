import { Candidate, Thesis } from '../../models/index.js';
import { BadRequestError } from '../../exception/errorResponse.js';
import moment from 'moment';
import { CONTACT_STATUSES } from '../../constants/committee.js';

const createThesis = async (data) => {
  try {

    if (data?.candidate?.birth) {
      data.candidate.birth = moment(data.candidate.birth, 'DD/MM/YYYY').toDate();
    }
    const candidate = await Candidate.findOneAndUpdate({
      email: data?.candidate?.email
    }, data.candidate, {
      upsert: true,
      new: true
    });

    delete data.candidate;

    const thesisExists = await Thesis.findOne({
      title: data.title,
      candidate: candidate._id
    });
    if (thesisExists) {
      throw new BadRequestError('Luận án đã tồn tại!');
    }

    if (data?.defense_date) {
      data.defense_date = moment(data.defense_date, 'DD/MM/YYYY').toDate();
    }
    const thesis = await Thesis.create({
      ...data,
      candidate: candidate._id
    });

    return thesis;
  } catch (error) {
    throw new BadRequestError(error);
  }
}

const getThesis = async ({
  page = 1,
  pageSize = 10,
  q = '',
  sort = 'defense_date',
  fromDefDate,
  toDefDate,
  status
}) => {
  const skip = (page - 1) * pageSize;
  const query = {
    $or: [{
      title: {
        $regex: q,
        $options: 'i'
      }
    }]
  };
  if (fromDefDate) {
    query.defense_date = {
      $gte: moment(fromDefDate, 'DD/MM/YYYY').toDate()
    }
  }
  if (toDefDate) {
    query.defense_date = {
      ...query.defense_date,
      $lte: moment(toDefDate, 'DD/MM/YYYY').toDate()
    }
  }
  if (status) {
    query['committees.status'] = status;
  }

  const total = await Thesis.countDocuments(query);
  const items = await Thesis.find(query)
    .populate('candidate')
    .sort({
      [sort]: -1
    })
    .skip(skip)
    .limit(pageSize);

  return {
    items,
    pagination: {
      page,
      pageSize,
      total
    }
  };
}

const getThesisById = async (id) => {
  const thesis = await Thesis.findById(id);
  if (!thesis) {
    throw new BadRequestError('Không tìm thấy luận án!');
  }
  return thesis;
}

const updateThesis = async (id, data) => {
  try {
    if (data?.candidate?.birth) {
      data.candidate.birth = moment(data.candidate.birth, 'DD/MM/YYYY').toDate();
    }
    const candidate = await Candidate.findOneAndUpdate({
      email: data?.candidate?.email
    }, data.candidate, {
      upsert: true,
      new: true
    });

    delete data.candidate;

    if (data?.defense_date) {
      data.defense_date = moment(data.defense_date, 'DD/MM/YYYY').toDate();
    }
    const thesis = await Thesis.findByIdAndUpdate(id, {
      ...data,
      candidate: candidate._id
    }, {
      new: true
    });

    return thesis;
  } catch (error) {
    throw new BadRequestError(error);
  }
}

const addCommittee = async (id, data) => {
  const thesis = await Thesis.findOne({
    _id: id
  }, {}, {autopopulate: false});
  if (!thesis) {
    throw new BadRequestError('Không tìm thấy luận án!');
  }

  const { committees = [] } = data;
  const current = thesis.committees.list;
  committees.map((committee) => {
    const {
      role,
      expert,
      contact_status = CONTACT_STATUSES.NOT_CONTACTED.value
    } = committee;
    if (!role || !expert || !contact_status) {
      throw new BadRequestError('Thiếu thông tin!');
    }

    const exist = current.find((item) => item.expert.toString() === expert);
    if (exist) {
      //update
      exist.role = role;
      exist.contact_status = contact_status;
    }
    else {
      //add
      current.push({
        expert,
        role,
        contact_status
      });
    }
  });

  await thesis.save();
}

export default {
  createThesis,
  getThesis,
  getThesisById,
  updateThesis,
  addCommittee
}
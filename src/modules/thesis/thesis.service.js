import { Candidate, Thesis } from '../../models/index.js';
import { BadRequestError } from '../../exception/errorResponse.js';
import moment from 'moment';

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

export default {
  createThesis,
  getThesis
}
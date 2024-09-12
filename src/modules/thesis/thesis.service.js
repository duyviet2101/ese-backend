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

export default {
  createThesis
}
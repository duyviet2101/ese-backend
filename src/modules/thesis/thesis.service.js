import { Candidate, Thesis } from '../../models/index.js';
import { BadRequestError } from '../../exception/errorResponse.js';

const createThesis = async (data) => {
  try {
    const candidate = await Candidate.findOneAndUpdate({
      email: data?.candidate?.email
    }, data.candidate, {
      upsert: true,
      new: true
    });-

    delete data.candidate;

    const res = await Thesis.create({
      ...data,
      candidate: candidate._id
    });

    return res;
  } catch (error) {
    throw new BadRequestError(error);
  }
}

export default {
  createThesis
}
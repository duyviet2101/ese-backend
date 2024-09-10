import catchAsync from '../../utils/catchAsync.js';
import ThesisService from './thesis.service.js';

const createThesis = catchAsync(async (req, res, next) => {
  const data = await ThesisService.createThesis(req.body);
  return res.status(201).json({ data });
})

export default {
  createThesis
}
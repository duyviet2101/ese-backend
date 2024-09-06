import catchAsync from '../../utils/catchAsync.js';
import ExpertService from './expert.service.js';

const searchExpert = catchAsync(async (req, res, next) => {
  const data = await ExpertService.searchExpert(req?.query);
  res.json(data);
})

export default {
  searchExpert
}
import catchAsync from '../../utils/catchAsync.js';
import ExpertService from './expert.service.js';

const searchExpert = catchAsync(async (req, res, next) => {
  const data = await ExpertService.searchExpert(req?.query);
  res.json(data);
})

const getSuggestions = catchAsync(async (req, res, next) => {
  const data = await ExpertService.getSuggestions(req?.query);
  res.json(data);
})

const getExpertById = catchAsync(async (req, res, next) => {
  const data = await ExpertService.getExpertById(req?.params?.id);
  res.json(data);
})

export default {
  searchExpert,
  getSuggestions,
  getExpertById
}
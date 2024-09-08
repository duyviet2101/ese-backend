import catchAsync from '../../utils/catchAsync.js';
import TopicService from './topic.service.js';

const getSuggestions = catchAsync(async (req, res, next) => {
  const data = await TopicService.getSuggestions(req.query);
  return res.json(data);
})

export default {
  getSuggestions
}
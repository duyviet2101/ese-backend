import catchAsync from '../../utils/catchAsync.js';
import ThesisService from './thesis.service.js';

const createThesis = catchAsync(async (req, res, next) => {
  const data = await ThesisService.createThesis(req.body);
  return res.status(201).json({ data });
})

const getThesis = catchAsync(async (req, res, next) => {
  const data = await ThesisService.getThesis(req.query);
  return res.status(200).json(data);
});

const getThesisById = catchAsync(async (req, res, next) => {
  const data = await ThesisService.getThesisById(req.params.id);
  return res.status(200).json(data);
});

const updateThesis = catchAsync(async (req, res, next) => {
  const data = await ThesisService.updateThesis(req.params.id, req.body);
  return res.status(200).json(data);
});

const addCommittee = catchAsync(async (req, res, next) => {
  const data = await ThesisService.addCommittee(req.params.id, req.body);
  return res.status(200).json(data);
});

const updateContactStatus = catchAsync(async (req, res, next) => {
  const data = await ThesisService.updateContactStatus(req.params.id, req.body);
  return res.status(200).json(data);
});

const deleteCommittee = catchAsync(async (req, res, next) => {
  await ThesisService.deleteCommittee({
    id: req.params.id,
    expertIds: req?.query?.ids?.split(',')
  });
  return res.status(204).send();
});

export default {
  createThesis,
  getThesis,
  getThesisById,
  updateThesis,
  addCommittee,
  updateContactStatus,
  deleteCommittee
}
import express from 'express';
import ExpertController from './expert.controller.js';

const router = express.Router();

router.get('/search', ExpertController.searchExpert);

router.get('/suggestions', ExpertController.getSuggestions);

router.get('/:id', ExpertController.getExpertById);

export default router;
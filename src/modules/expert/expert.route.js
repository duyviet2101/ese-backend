import express from 'express';
import ExpertController from './expert.controller.js';

const router = express.Router();

router.get('/search', ExpertController.searchExpert);

export default router;
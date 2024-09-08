import express from 'express';
import TopicController from './topic.controller.js';

const router = express.Router();

router.get('/suggestions', TopicController.getSuggestions);

export default router;
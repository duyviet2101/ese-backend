import express from 'express';
import ThesisController from './thesis.controller.js';

const router = express.Router();

router.post('/', ThesisController.createThesis);

router.get('/', ThesisController.getThesis);

export default router;
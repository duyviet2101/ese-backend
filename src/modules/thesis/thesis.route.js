import express from 'express';
import ThesisController from './thesis.controller.js';

const router = express.Router();

router.post('/', ThesisController.createThesis);

export default router;
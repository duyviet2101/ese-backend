import express from 'express';
import ThesisController from './thesis.controller.js';

const router = express.Router();

router.post('/', ThesisController.createThesis);

router.get('/', ThesisController.getThesis);

router.get('/:id', ThesisController.getThesisById);

router.patch('/:id', ThesisController.updateThesis);

router.post("/:id/committees", ThesisController.addCommittee);

router.patch("/:id/committees", ThesisController.updateContactStatus);

router.delete("/:id/committees", ThesisController.deleteCommittee);

export default router;
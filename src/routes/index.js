import express from "express";
import HelloWorldRoute from "../modules/helloWorld/helloWorld.route.js";
import ExpertRoute from '../modules/expert/expert.route.js';
import TopicRoute from '../modules/topic/topic.route.js';
import ThesisRoute from '../modules/thesis/thesis.route.js';

const router = express.Router();

router.use('/hello-world', HelloWorldRoute);

router.use('/experts', ExpertRoute)

router.use('/topics', TopicRoute);

router.use('/theses', ThesisRoute);

export default router;
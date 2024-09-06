import express from "express";
import HelloWorldRoute from "../modules/helloWorld/helloWorld.route.js";
import ExpertRoute from '../modules/expert/expert.route.js';

const router = express.Router();

router.use('/hello-world', HelloWorldRoute);

router.use('/experts', ExpertRoute)

export default router;
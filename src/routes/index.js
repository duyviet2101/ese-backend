import express from "express";
import HelloWorldRoute from "../modules/helloWorld/helloWorld.route.js";

const router = express.Router();

router.use('/hello-world', HelloWorldRoute);

export default router;
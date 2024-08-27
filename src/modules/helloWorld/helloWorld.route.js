import express from "express";
import HelloWorldController from "./helloWorld.controller.js";

const router = express.Router();

router.get('/', HelloWorldController.getHelloWorld);

router.get('/error', HelloWorldController.getError);

export default router;
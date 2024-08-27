import HelloWorldService from "./helloWorld.service.js";
import catchAsync from "../../utils/catchAsync.js";

const getHelloWorld = catchAsync(async (req, res, next) => {
  const data = await HelloWorldService.getHelloWorld();
  res.json(data);
});

const getError = catchAsync(async (req, res, next) => {
  const data = await HelloWorldService.getError();
  res.json(data);
});

export default {
  getHelloWorld,
  getError
}
import {BadRequestError} from "../../exception/errorResponse.js";


const getHelloWorld = async () => {
  return 'Hello World!';
};

const getError = async () => {
  throw new BadRequestError();
};

export default {
  getHelloWorld,
  getError
}
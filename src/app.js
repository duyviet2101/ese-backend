import express from 'express';
import morgan from 'morgan';
import helmet from 'helmet';
import compression from 'compression';
import dotenv from 'dotenv';
// import { checkOverload } from './helpers/check.connect';
import routes from './routes/index.js';
import {initializeMongoConnection} from "./databases/mongodb.js";

dotenv.config();

const app = express();

//! init middleware
app.use(morgan('dev')); //* app.use(morgan('combined'));
app.use(helmet()); //* che giấu thông tin header, bảo vệ khỏi các cuộc tấn công
app.use(compression()); //* giảm dung lượng trả về cho client
app.use(express.json()); //* parse json
app.use(express.urlencoded({
  extended: true
})); //* parse urlencoded
//! end init middleware

//! init db
initializeMongoConnection();
//! end init db

//! init routes
app.use('/api', routes);
//! end init routes

//! handle error
app.use((req, res, next) => {
  const error = new Error('Not found');
  error.status = 404;
  next(error);
});

app.use((error, req, res, next) => {
  res.status(error.status || 500);
  res.json({
    status: 'error',
    code: error.status || 500,
    message: error.message || 'Internal Server Error',
    stack: error.status === 500 ? error.stack : ''
  });
});
//! end handle error

export default app;
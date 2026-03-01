import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import mongoose from 'mongoose';
import path from 'path';
import { errors } from 'celebrate';
import dotenv from 'dotenv';
import uploadRouter from './routes/upload';
import productRouter from './routes/product';
import orderRouter from './routes/order';
import NotFoundError from './errors/not-found-error';
import errorHandler from './middleware/error-handler';
import { errorLogger, requestLogger } from './middleware/logger';
import authRouter from './routes/auth';

dotenv.config();

const app = express();

const { PORT = 3000 } = process.env;

mongoose.connect(process.env.DB_ADDRESS || 'mongodb://127.0.0.1:27017/weblarek');

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: process.env.ORIGIN_ALLOW || '',
    credentials: true,
  }),
);
app.use(requestLogger);
app.use('/product', productRouter);
app.use('/order', orderRouter);
app.use('/auth', authRouter);
app.use('/upload', uploadRouter);

app.use((_req, _res, next) => {
  next(new NotFoundError('Страница не найдена'));
});

app.use(errorLogger);

app.use(errors());
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`App started on port ${PORT}`);
});

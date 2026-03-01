import { Request, Response, NextFunction } from 'express';
import { Error as MongooseError } from 'mongoose';

const errorHandler = (
  err: any,
  _req: Request,
  res: Response,
  _next: NextFunction,
) => {
  if (err instanceof MongooseError.ValidationError) {
    return res.status(400).send({ message: err.message });
  }

  if (err.statusCode) {
    return res.status(err.statusCode).send({ message: err.message });
  }

  return res.status(500).send({ message: 'На сервере произошла ошибка' });
};

export default errorHandler;

import { NextFunction, Request, Response } from 'express';
import BadRequestError from '../errors/bad-request-error';

const uploadFile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.file) {
      throw new BadRequestError('Файл не загружен');
    }

    res.send({
      fileName: `/images/${req.file.filename}`,
      originalName: req.file.originalname,
    });
  } catch (err) {
    next(err);
  }
};

export default uploadFile;

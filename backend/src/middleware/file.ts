import multer, { FileFilterCallback } from 'multer';
import { Express, Request } from 'express';
import path from 'path';
// eslint-disable-next-line import/no-unresolved
import { v4 as uuidv4 } from 'uuid';

const storage = multer.diskStorage({
  destination: (_req: Request, _file, cb) => {
    cb(null, 'src/public/temp');
  },
  filename: (_req: Request, file, cb) => {
    const uniqueName = uuidv4() + path.extname(file.originalname);
    cb(null, uniqueName);
  },
});

const fileFilter = (_req: Request, file: Express.Multer.File, cb: FileFilterCallback) => {
  const allowedTypes = ['image/png', 'image/jpg', 'image/jpeg', 'image/gif', 'image/svg+xml'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Недопустимый тип файла'));
  }
};

const fileMiddleware = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
});

export default fileMiddleware;

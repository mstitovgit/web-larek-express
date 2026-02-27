import { Router } from 'express';
import fileMiddleware from '../middleware/file';
import uploadFile from '../controllers/upload';
import auth from '../middleware/auth';

const uploadRouter = Router();

uploadRouter.post('/', auth, fileMiddleware.single('file'), uploadFile);

export default uploadRouter;

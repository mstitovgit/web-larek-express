import { Router } from 'express';
import {
  refreshAccessToken,
  logout,
  getCurrentUser,
  login,
  register,
} from '../controllers/auth';
import { validateLoginData, validateRegisterData } from '../middleware/validations';
import auth from '../middleware/auth';

const authRouter = Router();

authRouter.get('/token', refreshAccessToken);
authRouter.get('/logout', auth, logout);
authRouter.get('/user', auth, getCurrentUser);
authRouter.post('/login', validateLoginData, login);
authRouter.post('/register', validateRegisterData, register);

export default authRouter;

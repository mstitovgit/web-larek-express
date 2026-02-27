import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import UnauthorizedError from '../errors/unauthorized-error';

const JWT_SECRET = process.env.JWT_SECRET || 'secret-key';

interface JwtPayload {
  _id: string;
}

const auth = async (
  req: Request & { user?: { _id: string } },
  _res: Response,
  next: NextFunction,
) => {
  const header = req.headers.authorization;

  if (!header || !header.startsWith('Bearer ')) {
    throw new UnauthorizedError('Требуется авторизация');
  }

  const token = header.replace('Bearer ', '');

  try {
    const payload = jwt.verify(token, JWT_SECRET) as JwtPayload;
    req.user = { _id: payload._id };
    return next();
  } catch (err) {
    return next(new UnauthorizedError('Невалидный токен'));
  }
};

export default auth;

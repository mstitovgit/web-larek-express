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
  try {
    const { authorization } = req.headers;

    if (!authorization || !authorization.startsWith('Bearer ')) {
      throw new UnauthorizedError('Требуется авторизация');
    }

    const token = authorization.replace('Bearer ', '');
    let payload;
    try {
      payload = jwt.verify(token, JWT_SECRET) as JwtPayload;
    } catch (err) {
      throw new UnauthorizedError('Требуется авторизация');
    }
    req.user = { _id: payload._id };
    next();
  } catch (err) {
    next(err);
  }
};

export default auth;

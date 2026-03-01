import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import User from '../models/user';
import { attachAuth } from '../service/auth';
import NotFoundError from '../errors/not-found-error';
import ConflictError from '../errors/conflict-error';
import BadRequestError from '../errors/bad-request-error';

export const register = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { name, email, password } = req.body;

    const hash = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hash,
    });

    const authData = await attachAuth(res, user);
    return res.send(authData);
  } catch (err) {
    if (err instanceof Error && err.message.includes('E11000')) {
      return next(new ConflictError('Пользователь с таким email уже существует'));
    }
    return next(err);
  }
};

export const login = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { email, password } = req.body;

    const user = await User.findUserByCredentials(email, password);

    const authData = await attachAuth(res, user);
    res.send(authData);
  } catch (err) {
    next(err);
  }
};

export const refreshAccessToken = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { refreshToken } = req.cookies;
    if (!refreshToken) {
      throw new BadRequestError('Отсутствует refresh token');
    }
    const user = await User.findUserByRefreshToken(refreshToken);

    const authData = await attachAuth(res, user);
    res.send(authData);
  } catch (err) {
    next(err);
  }
};

export const logout = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { refreshToken } = req.cookies;

    if (!refreshToken) {
      return res.send({ success: true });
    }

    const user = await User.findUserByRefreshToken(refreshToken);

    user.tokens = user.tokens.filter((t) => t !== refreshToken);
    await user.save();

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      sameSite: 'lax',
      secure: false,
      path: '/',
      maxAge: 0,
    });

    return res.send({ success: true });
  } catch (err) {
    return next(err);
  }
};

export const getCurrentUser = async (
  req: Request & { user?: { _id: string } },
  res: Response,
  next: NextFunction,
) => {
  try {
    const user = await User.findById(req.user?._id);

    if (!user) {
      throw new NotFoundError('Пользователь не найден');
    }

    return res.send({
      success: true,
      user: {
        name: user.name,
        email: user.email,
      },
    });
  } catch (err) {
    if (err instanceof mongoose.Error.CastError) {
      return next(new BadRequestError('Невалидный идентификтор'));
    }
    return next(err);
  }
};

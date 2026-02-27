import { Response } from 'express';
import jwt from 'jsonwebtoken';
import ms from 'ms';
import { IUserDocument } from '../models/user';

const JWT_SECRET = process.env.JWT_SECRET || 'secret-key';
const AUTH_ACCESS_TOKEN_EXPIRY = ms((process.env.AUTH_ACCESS_TOKEN_EXPIRY ?? '10m') as ms.StringValue);
const AUTH_REFRESH_TOKEN_EXPIRY = ms((process.env.AUTH_REFRESH_TOKEN_EXPIRY ?? '7d') as ms.StringValue);

export const createTokens = (_id: string) => {
  const accessToken = jwt.sign({ _id }, JWT_SECRET, {
    expiresIn: AUTH_ACCESS_TOKEN_EXPIRY,
  });
  const refreshToken = jwt.sign({ _id }, JWT_SECRET, {
    expiresIn: AUTH_REFRESH_TOKEN_EXPIRY,
  });
  return { accessToken, refreshToken };
};

export const attachAuth = async (res: Response, user: IUserDocument) => {
  const { accessToken, refreshToken } = createTokens(user._id.toString());

  user.tokens.push(refreshToken);
  await user.save();

  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    sameSite: 'lax',
    secure: false,
    maxAge: ms(
      (process.env.AUTH_REFRESH_TOKEN_EXPIRY ?? '7d') as ms.StringValue,
    ),
    path: '/',
  });

  return {
    user: {
      name: user.name,
      email: user.email,
    },
    success: 'true',
    accessToken,
  };
};

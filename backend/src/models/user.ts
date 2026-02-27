import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import UnauthorizedError from '../errors/unauthorized-error';
import NotFoundError from '../errors/not-found-error';
import BadRequestError from '../errors/bad-request-error';

interface JwtPayload {
  _id: string;
}

export interface IUser {
  name: string;
  email: string;
  password: string;
  tokens: string[];
}
export interface IUserDocument extends IUser, mongoose.Document {}

interface UserModel extends mongoose.Model<IUser> {
  findUserByCredentials: (
    email: string,
    password: string
  ) => Promise<IUserDocument>;

  findUserByRefreshToken(refreshToken: string): Promise<IUserDocument>;
}

const JWT_SECRET = process.env.JWT_SECRET || 'secret-key';

const userSchema = new mongoose.Schema<IUser>({
  name: {
    type: String,
    minlength: [2, 'Минимальная длина поля "name" - 2'],
    maxlength: [30, 'Максимальная длина поля "name" – 30'],
    default: 'Ё-мое',
  },
  email: {
    type: String,
    required: [true, 'Поле "email" должно быть заполнено'],
    unique: true,
  },
  password: {
    type: String,
    minlength: [6, 'Минимальная длина поля "password" - 6'],
    required: [true, 'Поле "password" должно быть заполнено'],
    select: false,
  },
  tokens: {
    type: [String],
    default: [],
    select: false,
  },
});

userSchema.static(
  'findUserByCredentials',
  async function findUserByCredentials(email: string, password: string) {
    const user = await this.findOne({ email }).select('+password +tokens');

    if (!user) {
      throw new UnauthorizedError('Неправильная почта или пароль');
    }

    const matched = await bcrypt.compare(password, user.password);

    if (!matched) {
      throw new UnauthorizedError('Неправильная почта или пароль');
    }

    return user;
  },
);

userSchema.static(
  'findUserByRefreshToken',
  async function findUserByRefreshToken(refreshToken: string) {
    let payload: JwtPayload;
    try {
      payload = jwt.verify(refreshToken, JWT_SECRET) as JwtPayload;
    } catch {
      throw new UnauthorizedError('Невалидный refresh token');
    }

    if (!mongoose.Types.ObjectId.isValid(payload._id)) {
      throw new BadRequestError('Некорректный id пользователя');
    }

    const user = await this.findById(payload._id).select('+tokens');

    if (!user || !user.tokens.includes(refreshToken)) {
      throw new NotFoundError('Пользователь не найден');
    }

    return user;
  },
);

export default mongoose.model<IUser, UserModel>('user', userSchema);

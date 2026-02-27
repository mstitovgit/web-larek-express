import { Request, Response, NextFunction } from 'express';
import { celebrate, Joi, Segments } from 'celebrate';
import BadRequestError from '../errors/bad-request-error';
import Product from '../models/product';
import { IUser } from '../models/user';

enum Payment {
  Card = 'card',
  Online = 'online',
}

interface IOrder {
  items: string[];
  total: number;
  payment: Payment;
  email: string;
  phone: string;
  address: string;
}

interface IProduct {
  title: string;
  image: {
    fileName: string;
    originalName: string;
  };
  category: string;
  description: string;
  price: number;
}

const OrderSchema = Joi.object<IOrder>({
  items: Joi.array()
    .items(Joi.string().hex().length(24).required())
    .min(1)
    .required(),

  total: Joi.number().positive().required(),

  payment: Joi.string().valid(Payment.Card, Payment.Online).required(),

  email: Joi.string().email().required(),

  phone: Joi.string().required(),

  address: Joi.string().required(),
});

const productSchema = Joi.object<IProduct>({
  title: Joi.string().min(2).max(30).required(),
  image: Joi.object({
    fileName: Joi.string().required(),
    originalName: Joi.string().required(),
  }).required(),
  category: Joi.string().required(),
  description: Joi.string(),
  price: Joi.number().allow(null).default(null),
});

const productUpdateSchema = Joi.object<IProduct>({
  title: Joi.string().min(2).max(30),
  image: Joi.object({
    fileName: Joi.string().required(),
    originalName: Joi.string().required(),
  }),
  category: Joi.string(),
  description: Joi.string(),
  price: Joi.number().allow(null),
}).min(1);

const RegisterSchema = Joi.object<IUser>({
  name: Joi.string().min(2).max(30).default('Ё-мое'),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
});

const LoginSchema = Joi.object<IUser>({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
});

export const validateOrderSchema = celebrate({ [Segments.BODY]: OrderSchema });

export const validateOrderBusiness = async (
  req: Request,
  _res: Response,
  next: NextFunction,
) => {
  try {
    const { items, total } = req.body;

    const products = await Product.find({
      _id: { $in: items },
    }).lean();

    if (products.length !== items.length) {
      throw new BadRequestError('Один или несколько товаров не найдены');
    }

    const hasUnavailable = products.some((product) => product.price === null);

    if (hasUnavailable) {
      throw new BadRequestError('В заказе есть недоступные товары');
    }

    const calculatedTotal = products.reduce(
      (sum, product) => sum + product.price!,
      0,
    );

    if (calculatedTotal !== total) {
      throw new BadRequestError('Итоговая сумма не совпадает');
    }
    return next();
  } catch (err) {
    return next(err);
  }
};

export const validateObjId = celebrate({
  [Segments.PARAMS]: Joi.object({
    productId: Joi.string().hex().length(24).required(),
  }),
});

export const validateProductBody = celebrate({
  [Segments.BODY]: productSchema,
});

export const validateProductUpdateBody = celebrate({
  [Segments.BODY]: productUpdateSchema,
});

export const validateRegisterData = celebrate({
  [Segments.BODY]: RegisterSchema,
});

export const validateLoginData = celebrate({
  [Segments.BODY]: LoginSchema,
});

import { NextFunction, Response, Request } from 'express';
import ConflictError from '../errors/conflict-error';
import Product from '../models/product';
import NotFoundError from '../errors/not-found-error';
import { moveImage, removeImage } from '../service/file';

export const createProduct = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const product = await Product.create(req.body);

    await moveImage(product.image.fileName);
    return res.send({
      description: product.description,
      image: product.image,
      title: product.title,
      category: product.category,
      price: product.price,
    });
  } catch (err) {
    if (err instanceof Error && err.message.includes('E11000')) {
      return next(new ConflictError('Товар с таким заголовком уже существует'));
    }

    return next(err);
  }
};

export const getProducts = (
  _req: Request,
  res: Response,
  next: NextFunction,
) => {
  Product.find()
    .then((items) => res.send({ items, total: items.length }))
    .catch(next);
};

export const deleteProduct = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { productId } = req.params;

    const product = await Product.findById(productId);

    if (!product) {
      throw new NotFoundError('Нет товара по заданному id');
    }

    await removeImage(product.image.fileName);
    await Product.findByIdAndDelete(productId);
    res.send(product);
  } catch (err) {
    next(err);
  }
};

export const updateProduct = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { productId } = req.params;
    const updateData = req.body;

    const product = await Product.findByIdAndUpdate(productId, updateData, {
      new: true,
      runValidators: true,
    });

    if (!product) {
      throw new NotFoundError('Нет товара по заданному id');
    }

    if (updateData.image) {
      await moveImage(product.image.fileName);
    }

    res.send(product);
  } catch (err) {
    if (err instanceof Error && err.message.includes('E11000')) {
      throw new ConflictError('Товар с таким заголовком уже существует');
    }
    next(err);
  }
};

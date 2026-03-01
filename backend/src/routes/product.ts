import { Router } from 'express';

import {
  createProduct,
  getProducts,
  deleteProduct,
  updateProduct,
} from '../controllers/product';

import {
  validateObjId,
  validateProductBody,
  validateProductUpdateBody,
} from '../middleware/validations';

import auth from '../middleware/auth';

const productRouter = Router();

productRouter.get('/', getProducts);

productRouter.post('/', auth, validateProductBody, createProduct);

productRouter.delete('/:productId', auth, validateObjId, deleteProduct);

productRouter.patch(
  '/:productId',
  auth,
  validateObjId,
  validateProductUpdateBody,
  updateProduct,
);

export default productRouter;

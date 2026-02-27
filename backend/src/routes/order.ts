import { Router } from 'express';
import createOrder from '../controllers/order';
import { validateOrderBusiness, validateOrderSchema } from '../middleware/validations';

const orderRouter = Router();

orderRouter.post('/', validateOrderSchema, validateOrderBusiness, createOrder);

export default orderRouter;

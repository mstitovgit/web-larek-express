import { Request, Response } from 'express';
import { faker } from '@faker-js/faker';

const createOrder = (req: Request, _res: Response) => {
  _res.send({
    id: faker.string.uuid(),
    total: req.body.total,
  });
};

export default createOrder;

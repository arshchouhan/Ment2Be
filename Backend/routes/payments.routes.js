
import { Router } from 'express';

const paymentsRouter = Router();

paymentsRouter.post('/',MakePaymentHandler);
paymentsRouter.get('/:id', GetPaymentHandler);

export default paymentsRouter;
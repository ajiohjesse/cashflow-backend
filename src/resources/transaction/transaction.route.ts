import { Router } from 'express';
import { TransactionController } from './transaction.controller';
import { TransactionService } from './transaction.service';

const route = Router();
export { route as transactionRoute };

const transactionService = new TransactionService();
const transactionController = new TransactionController(transactionService);

route.post('/v1/inflow', transactionController.createInflow);
route.post('/v1/outflow', transactionController.createOutflow);

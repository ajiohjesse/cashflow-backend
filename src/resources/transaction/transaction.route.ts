import { authHandler } from '@/middleware/auth.middleware';
import { Router } from 'express';
import { TransactionController } from './transaction.controller';
import { TransactionService } from './transaction.service';

const route = Router();
export { route as transactionRoute };

const transactionService = new TransactionService();
const transactionController = new TransactionController(transactionService);

route.post('/v1/inflows', authHandler, transactionController.createInflow);
route.post('/v1/outflows', authHandler, transactionController.createOutflow);

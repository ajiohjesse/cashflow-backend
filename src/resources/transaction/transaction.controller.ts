import { APIErrors } from '@/libraries/error.lib';
import { RequestValidator } from '@/libraries/request.lib';
import { ResponseData } from '@/libraries/response.lib';
import type { RequestHandler } from 'express';
import { StatusCodes } from 'http-status-codes';
import type { TransactionService } from './transaction.service';
import {
  insertTransactionSchema,
  type SelectTransactionDTO,
} from './transaction.validators';

export class TransactionController {
  constructor(private service: TransactionService) {
    this.service = service;
  }

  createInflow: RequestHandler = async (req, res) => {
    if (!res.locals.user) {
      throw APIErrors.authenticationError();
    }

    const userId = res.locals.user.userId;
    const inflow = RequestValidator.validateBody(
      req.body,
      insertTransactionSchema
    );

    const createdInflow = await this.service.createTransaction({
      userId,
      type: 'inflow',
      transaction: inflow,
    });

    res
      .status(StatusCodes.CREATED)
      .json(
        ResponseData.success<SelectTransactionDTO>(
          StatusCodes.CREATED,
          'Inflow created successfully',
          createdInflow
        )
      );
  };

  createOutflow: RequestHandler = async (req, res) => {
    if (!res.locals.user) {
      throw APIErrors.authenticationError();
    }

    const userId = res.locals.user.userId;
    const outflow = RequestValidator.validateBody(
      req.body,
      insertTransactionSchema
    );

    const createdOutflow = await this.service.createTransaction({
      userId,
      type: 'outflow',
      transaction: outflow,
    });

    res
      .status(StatusCodes.CREATED)
      .json(
        ResponseData.success<SelectTransactionDTO>(
          StatusCodes.CREATED,
          'Outflow created successfully',
          createdOutflow
        )
      );
  };
}

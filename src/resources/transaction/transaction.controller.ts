import { APIErrors } from '@/libraries/error.lib';
import { RequestValidator } from '@/libraries/request.lib';
import { ResponseData } from '@/libraries/response.lib';
import type { RequestHandler } from 'express';
import { StatusCodes } from 'http-status-codes';
import type { TransactionService } from './transaction.service';
import {
  insertTransactionSchema,
  transactionParamsSchema,
  transactionsQuerySchema,
  type SelectTransactionDTO,
  type SelectTransactionWithCategoryDTO,
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

  getTransactions: RequestHandler = async (req, res) => {
    if (!res.locals.user) {
      throw APIErrors.authenticationError();
    }

    const query = RequestValidator.validateQuery(
      req.query,
      transactionsQuerySchema
    );
    const userId = res.locals.user.userId;
    const { transactions, total } = await this.service.getTransactions({
      userId,
      ...query,
    });

    res.status(StatusCodes.OK).json(
      ResponseData.successWithPagination<
        'transactions',
        SelectTransactionWithCategoryDTO
      >(StatusCodes.OK, 'Retrieved transactions successfully', {
        items: {
          transactions,
        },
        pagination: {
          currentPage: query.page,
          limit: query.limit,
          totalCount: total,
        },
      })
    );
  };

  deleteInflow: RequestHandler = async (req, res) => {
    if (!res.locals.user) {
      throw APIErrors.authenticationError();
    }

    const { id: transactionId } = RequestValidator.validateParams(
      req.params,
      transactionParamsSchema
    );
    const userId = res.locals.user.userId;

    await this.service.deleteTransaction({
      type: 'inflow',
      userId,
      transactionId,
    });

    res
      .status(StatusCodes.NO_CONTENT)
      .json(
        ResponseData.success(
          StatusCodes.NO_CONTENT,
          'Transaction deleted successfully'
        )
      );
  };

  deleteOutflow: RequestHandler = async (req, res) => {
    if (!res.locals.user) {
      throw APIErrors.authenticationError();
    }

    const { id: transactionId } = RequestValidator.validateParams(
      req.params,
      transactionParamsSchema
    );
    const userId = res.locals.user.userId;

    await this.service.deleteTransaction({
      type: 'outflow',
      userId,
      transactionId,
    });

    res
      .status(StatusCodes.NO_CONTENT)
      .json(
        ResponseData.success(
          StatusCodes.NO_CONTENT,
          'Transaction deleted successfully'
        )
      );
  };
}

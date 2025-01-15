import {
  generateOpenAPIResponses,
  openApiUnauthenticatedResponse,
} from '@/libraries/openapi.lib';
import { generatePaginatedDataSchema } from '@/libraries/response.lib';
import { OpenAPIRegistry } from '@asteasolutions/zod-to-openapi';
import { StatusCodes } from 'http-status-codes';
import {
  insertTransactionSchema,
  selectTransactionSchema,
  selectTransactionWithCategorySchema,
  transactionsQuerySchema,
} from './transaction.validators';

const registry = new OpenAPIRegistry();
export { registry as transactionRegistry };

registry.register('SelectTransactionDTO', selectTransactionSchema);
registry.register(
  'SelectTransactionWithCategoryDTO',
  selectTransactionWithCategorySchema
);
registry.register('InsertTransactionDTO', insertTransactionSchema);

registry.registerPath({
  path: '/v1/inflows',
  method: 'post',
  operationId: 'createInflow',
  summary: 'Create Inflow',
  description: 'Create an inflow',
  tags: ['Transaction'],
  request: {
    body: {
      content: {
        'application/json': {
          schema: insertTransactionSchema,
        },
      },
    },
  },
  responses: generateOpenAPIResponses([
    {
      success: true,
      statusCode: StatusCodes.CREATED,
      message: 'Inflow created successfully',
      schema: selectTransactionSchema,
    },
    openApiUnauthenticatedResponse,
  ]),
});

registry.registerPath({
  path: '/v1/outflows',
  method: 'post',
  operationId: 'createOutflow',
  summary: 'Create Outflow',
  description: 'Create an outflow',
  tags: ['Transaction'],
  request: {
    body: {
      content: {
        'application/json': {
          schema: insertTransactionSchema,
        },
      },
    },
  },
  responses: generateOpenAPIResponses([
    {
      success: true,
      statusCode: StatusCodes.CREATED,
      message: 'Outflow created successfully',
      schema: selectTransactionSchema,
    },
    openApiUnauthenticatedResponse,
  ]),
});

registry.registerPath({
  path: '/v1/transactions',
  method: 'get',
  operationId: 'getTransactions',
  summary: 'Get transactions',
  description: 'Get all inflow and outflows',
  tags: ['Transaction'],
  request: {
    query: transactionsQuerySchema,
  },
  responses: generateOpenAPIResponses([
    {
      success: true,
      statusCode: StatusCodes.OK,
      message: 'Retrieved transactions successfully',
      schema: generatePaginatedDataSchema(
        'transactions',
        selectTransactionWithCategorySchema
      ),
    },
    openApiUnauthenticatedResponse,
  ]),
});

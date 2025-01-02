import {
  generateOpenAPIResponses,
  openApiUnauthenticatedResponse,
} from '@/libraries/openapi.lib';
import { OpenAPIRegistry } from '@asteasolutions/zod-to-openapi';
import { StatusCodes } from 'http-status-codes';
import {
  insertTransactionSchema,
  selectTransactionSchema,
  selectTransactionWithCategorySchema,
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
  path: '/v1/inflow',
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
  path: '/v1/outflow',
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

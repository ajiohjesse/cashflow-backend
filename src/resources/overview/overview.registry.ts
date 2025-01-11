import {
  generateOpenAPIResponses,
  openApiUnauthenticatedResponse,
} from '@/libraries/openapi.lib';
import { OpenAPIRegistry } from '@asteasolutions/zod-to-openapi';
import { StatusCodes } from 'http-status-codes';
import { z } from 'zod';
import { overviewQuerySchema, overviewSchema } from './overview.validators';

const registry = new OpenAPIRegistry();
export { registry as overviewRegistry };

registry.register('OverviewDTO', overviewSchema);

registry.registerPath({
  path: '/v1/overview',
  method: 'get',
  operationId: 'getOverview',
  summary: 'Get Expense Overview',
  description: 'Get the overview of inlows and outflows',
  tags: ['Overview'],
  request: {
    query: overviewQuerySchema,
  },
  responses: generateOpenAPIResponses([
    {
      success: true,
      statusCode: StatusCodes.OK,
      message: 'Overview retrieved successfully',
      schema: overviewSchema,
    },
    openApiUnauthenticatedResponse,
  ]),
});

registry.registerPath({
  path: '/v1/overview/summary',
  method: 'get',
  operationId: 'getFinancialSummary',
  summary: 'Get Overview financial summary',
  description: 'Get the overview financial summary of inlows and outflows',
  tags: ['Overview'],
  responses: generateOpenAPIResponses([
    {
      success: true,
      statusCode: StatusCodes.OK,
      message: 'Overview retrieved successfully',
      schema: z.object({
        summary: z.string(),
      }),
    },
    openApiUnauthenticatedResponse,
  ]),
});

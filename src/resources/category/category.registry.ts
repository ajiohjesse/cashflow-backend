import {
  generateOpenAPIResponses,
  openApiUnauthenticatedResponse,
} from '@/libraries/openapi.lib';
import { generatePaginatedDataSchema } from '@/libraries/response.lib';
import { OpenAPIRegistry } from '@asteasolutions/zod-to-openapi';
import { StatusCodes } from 'http-status-codes';
import { z } from 'zod';
import {
  categoryParamsSchema,
  insertCategorySchema,
  selectCategorySchema,
} from './category.validators';

const registry = new OpenAPIRegistry();
export { registry as categoryRegistry };

registry.register('SelectCategoryDTO', selectCategorySchema);
registry.register('InsertCategoryDTO', insertCategorySchema);

registry.registerPath({
  path: '/v1/categories/inflow',
  method: 'get',
  operationId: 'getInflowCategories',
  summary: 'Get Inflow Categories',
  description: 'Get the inflow categories',
  tags: ['Category'],
  responses: generateOpenAPIResponses([
    {
      success: true,
      statusCode: StatusCodes.OK,
      message: 'Inflow categories retrieved successfully',
      schema: generatePaginatedDataSchema(
        'inflowCategories',
        selectCategorySchema
      ),
    },
    openApiUnauthenticatedResponse,
  ]),
});

registry.registerPath({
  path: '/v1/categories/outflow',
  method: 'get',
  operationId: 'getOutflowCategories',
  summary: 'Get Outflow Categories',
  description: 'Get the outflow categories',
  tags: ['Category'],
  responses: generateOpenAPIResponses([
    {
      success: true,
      statusCode: StatusCodes.OK,
      message: 'Outflow categories retrieved successfully',
      schema: generatePaginatedDataSchema(
        'outflowCategories',
        selectCategorySchema
      ),
    },
    openApiUnauthenticatedResponse,
  ]),
});

registry.registerPath({
  path: '/v1/categories/inflow',
  method: 'post',
  operationId: 'createInflowCategory',
  summary: 'Create Inflow Category',
  description: 'Create an inflow category',
  tags: ['Category'],
  request: {
    body: {
      content: {
        'application/json': {
          schema: insertCategorySchema,
        },
      },
    },
  },
  responses: generateOpenAPIResponses([
    {
      success: true,
      statusCode: StatusCodes.CREATED,
      message: 'Inflow category created successfully',
      schema: selectCategorySchema,
    },
    {
      success: false,
      statusCode: StatusCodes.CONFLICT,
      message: 'Category with this name already exists',
      schema: z.object({
        categoryName: z.string(),
      }),
    },
    openApiUnauthenticatedResponse,
  ]),
});

registry.registerPath({
  path: '/v1/categories/outflow',
  method: 'post',
  operationId: 'createOutflowCategory',
  summary: 'Create Outflow Category',
  description: 'Create an outflow category',
  tags: ['Category'],
  request: {
    body: {
      content: {
        'application/json': {
          schema: insertCategorySchema,
        },
      },
    },
  },
  responses: generateOpenAPIResponses([
    {
      success: true,
      statusCode: StatusCodes.CREATED,
      message: 'Outflow category created successfully',
      schema: selectCategorySchema,
    },
    {
      success: false,
      statusCode: StatusCodes.CONFLICT,
      message: 'Category with this name already exists',
      schema: z.object({
        categoryName: z.string(),
      }),
    },
    openApiUnauthenticatedResponse,
  ]),
});

registry.registerPath({
  path: '/v1/categories/inflow/{id}',
  method: 'delete',
  operationId: 'deleteInflowCategory',
  summary: 'Delete Inflow Category',
  description: 'Delete an inflow category',
  tags: ['Category'],
  request: {
    params: categoryParamsSchema,
  },
  responses: generateOpenAPIResponses([
    {
      success: true,
      statusCode: StatusCodes.NO_CONTENT,
      message: 'Inflow category deleted successfully',
      schema: z.object({}),
    },
    openApiUnauthenticatedResponse,
  ]),
});

registry.registerPath({
  path: '/v1/categories/outflow/{id}',
  method: 'delete',
  operationId: 'deleteOutflowCategory',
  summary: 'Delete Outflow Category',
  description: 'Delete an outflow category',
  tags: ['Category'],
  request: {
    params: categoryParamsSchema,
  },
  responses: generateOpenAPIResponses([
    {
      success: true,
      statusCode: StatusCodes.NO_CONTENT,
      message: 'Outflow category deleted successfully',
      schema: z.object({}),
    },
    openApiUnauthenticatedResponse,
  ]),
});

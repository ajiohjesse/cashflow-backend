import { generateOpenAPIResponses } from '@/libraries/openapi.lib';
import { OpenAPIRegistry } from '@asteasolutions/zod-to-openapi';
import { StatusCodes } from 'http-status-codes';
import { z } from 'zod';

const registry = new OpenAPIRegistry();
export { registry as healthRegistry };

registry.registerPath({
  path: '/health-check',
  method: 'get',
  operationId: 'health-check',
  summary: 'Health check',
  description: 'Check if the server is running',
  tags: ['Health'],
  responses: generateOpenAPIResponses([
    {
      success: true,
      statusCode: StatusCodes.OK,
      message: 'Server is running',
      schema: z.object({}),
    },
  ]),
});

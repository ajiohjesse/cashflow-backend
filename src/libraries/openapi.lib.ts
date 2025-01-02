import { type ResponseConfig } from '@asteasolutions/zod-to-openapi';
import { StatusCodes } from 'http-status-codes';
import z from 'zod';
import { generateApiResponseSchema } from './response.lib';

type OpenAPIResponseConfig = {
  schema: z.ZodType;
  message: string;
  statusCode: StatusCodes;
  success: boolean;
};

export function generateOpenAPIResponses(configs: OpenAPIResponseConfig[]) {
  const responses: { [key: string]: ResponseConfig } = {
    [StatusCodes.TOO_MANY_REQUESTS]: {
      description: 'Rate Limit Exceeded',
      content: {
        'application/json': {
          schema: generateApiResponseSchema({
            dataSchema: z.object({}),
            statusCode: StatusCodes.TOO_MANY_REQUESTS,
            success: false,
            message: 'Too many requests, please try again later',
          }),
        },
      },
    },
    [StatusCodes.INTERNAL_SERVER_ERROR]: {
      description: 'Internal server error',
      content: {
        'application/json': {
          schema: generateApiResponseSchema({
            dataSchema: z.object({}),
            statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
            success: false,
            message: 'Unable to process request',
          }),
        },
      },
    },
  };

  configs.forEach(({ schema, message, statusCode, success }) => {
    responses[statusCode] = {
      description: message,
      content: {
        'application/json': {
          schema: generateApiResponseSchema({
            dataSchema: schema,
            statusCode,
            success,
            message,
          }),
        },
      },
    };
  });
  return responses;
}

export const openApiNotFoundResponse: OpenAPIResponseConfig = {
  schema: z.object({}),
  message: 'Resource not found',
  statusCode: StatusCodes.NOT_FOUND,
  success: false,
};

export const openApiUnauthenticatedResponse: OpenAPIResponseConfig = {
  schema: z.object({}),
  message: 'Unauthenticated Request',
  statusCode: StatusCodes.UNAUTHORIZED,
  success: false,
};

export const openApiForbiddenResponse: OpenAPIResponseConfig = {
  schema: z.object({}),
  message: 'You are not authorized to access this resource',
  statusCode: StatusCodes.FORBIDDEN,
  success: false,
};

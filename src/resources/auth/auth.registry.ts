import { generateOpenAPIResponses } from '@/libraries/openapi.lib';
import { OpenAPIRegistry } from '@asteasolutions/zod-to-openapi';
import { StatusCodes } from 'http-status-codes';
import { z } from 'zod';
import {
  insertUserSchema,
  loginUserSchema,
  refreshUserSchema,
  selectUserSchema,
} from './auth.validators';

const registry = new OpenAPIRegistry();
export { registry as authRegisty };

registry.register('SelectUserDTO', selectUserSchema);
registry.register('InsertUserDTO', insertUserSchema);

registry.registerPath({
  path: '/v1/register',
  method: 'post',
  operationId: 'register',
  summary: 'Register',
  description: 'Register a new user',
  tags: ['Auth'],
  request: {
    body: {
      content: {
        'application/json': {
          schema: insertUserSchema,
        },
      },
    },
  },
  responses: generateOpenAPIResponses([
    {
      success: true,
      statusCode: StatusCodes.CREATED,
      message: 'Registration successfull',
      schema: z.intersection(
        selectUserSchema,
        z.object({ accessToken: z.string() })
      ),
    },
    {
      success: false,
      statusCode: StatusCodes.CONFLICT,
      message: 'User with this email already exists',
      schema: z.object({
        email: z.string().email().openapi({ example: 'jb@example.com' }),
      }),
    },
  ]),
});

registry.registerPath({
  path: '/v1/login',
  method: 'post',
  operationId: 'login',
  summary: 'Login',
  description: 'Login a user',
  tags: ['Auth'],
  request: {
    body: {
      content: {
        'application/json': {
          schema: loginUserSchema,
        },
      },
    },
  },
  responses: generateOpenAPIResponses([
    {
      success: true,
      statusCode: StatusCodes.OK,
      message: 'Login successfull',
      schema: z.intersection(
        selectUserSchema,
        z.object({ accessToken: z.string() })
      ),
    },
  ]),
});

registry.registerPath({
  path: '/v1/refresh',
  method: 'get',
  operationId: 'refresh',
  summary: 'Refresh',
  description: 'Refresh the access token',
  tags: ['Auth'],
  responses: generateOpenAPIResponses([
    {
      success: true,
      statusCode: StatusCodes.OK,
      message: 'Refresh successfull',
      schema: refreshUserSchema,
    },
  ]),
});

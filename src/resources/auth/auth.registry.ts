import { generateOpenAPIResponses } from '@/libraries/openapi.lib';
import { OpenAPIRegistry } from '@asteasolutions/zod-to-openapi';
import { StatusCodes } from 'http-status-codes';
import { z } from 'zod';
import {
  forgotPasswordSchema,
  insertUserSchema,
  loginUserSchema,
  refreshUserSchema,
  resetPasswordSchema,
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

registry.registerPath({
  path: '/v1/profile',
  method: 'get',
  operationId: 'getProfile',
  summary: 'Get Profile',
  description: 'Get the user profile',
  tags: ['Auth'],
  responses: generateOpenAPIResponses([
    {
      success: true,
      statusCode: StatusCodes.OK,
      message: 'Profile retrieved successfully',
      schema: selectUserSchema,
    },
  ]),
});

registry.registerPath({
  path: '/v1/logout',
  method: 'post',
  operationId: 'logout',
  summary: 'Logout',
  description: 'Logout the user',
  tags: ['Auth'],
  responses: generateOpenAPIResponses([
    {
      success: true,
      statusCode: StatusCodes.OK,
      message: 'Logout successfull',
      schema: z.object({}),
    },
  ]),
});

registry.registerPath({
  path: '/v1/forgot-password',
  method: 'post',
  operationId: 'forgotPassword',
  summary: 'Forgot Password',
  description: 'Request to reset password',
  tags: ['Auth'],
  request: {
    body: {
      content: {
        'application/json': {
          schema: forgotPasswordSchema,
        },
      },
    },
  },
  responses: generateOpenAPIResponses([
    {
      success: true,
      statusCode: StatusCodes.OK,
      message: 'Reset password link sent to your email',
      schema: z.object({}),
    },
  ]),
});

registry.registerPath({
  path: '/v1/reset-password',
  method: 'post',
  operationId: 'resetPassword',
  summary: 'Reset Password',
  description: 'Set a new password',
  tags: ['Auth'],
  request: {
    body: {
      content: {
        'application/json': {
          schema: resetPasswordSchema,
        },
      },
    },
  },
  responses: generateOpenAPIResponses([
    {
      success: true,
      statusCode: StatusCodes.OK,
      message: 'Password reset successfully',
      schema: z.object({}),
    },
  ]),
});

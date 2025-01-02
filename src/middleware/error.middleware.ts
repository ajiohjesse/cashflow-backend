import { PublicError } from '@/libraries/error.lib';
import { logger } from '@/libraries/logger.lib';
import { ResponseData } from '@/libraries/response.lib';
import type { ErrorRequestHandler } from 'express';

export const errorHandler: ErrorRequestHandler = (
  error,
  _request,
  response,
  _next
) => {
  if (error instanceof PublicError) {
    response
      .status(error.statusCode)
      .json(ResponseData.error(error.statusCode, error.message, error.data));
  } else {
    logger.error('Unhandled Error: --> ', error);
    response.status(500).json(ResponseData.error(500, 'Internal server error'));
  }
};

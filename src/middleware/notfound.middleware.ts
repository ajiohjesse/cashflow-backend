import { ResponseData } from '@/libraries/response.lib';
import type { RequestHandler } from 'express';

export const notFoundHandler: RequestHandler = (_, res) => {
  res.status(404).json(ResponseData.error(404, 'Resource Not Found'));
};

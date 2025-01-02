import { ResponseData } from '@/libraries/response.lib';
import { TokenService } from '@/libraries/token.lib';
import type { RequestHandler } from 'express';
import { StatusCodes } from 'http-status-codes';

export const authHandler: RequestHandler = (req, res, next) => {
  const authorization = req.headers.authorization;
  if (!authorization) {
    res
      .status(StatusCodes.UNAUTHORIZED)
      .json(
        ResponseData.error(StatusCodes.UNAUTHORIZED, 'Bearer token is required')
      );
    return;
  }

  const [scheme, token] = authorization.split(' ');
  if (scheme.toLowerCase() !== 'bearer') {
    res
      .status(StatusCodes.UNAUTHORIZED)
      .json(
        ResponseData.error(StatusCodes.UNAUTHORIZED, 'Bearer token is required')
      );
    return;
  }

  const payload = TokenService.verifyAccessToken(token);
  if (!payload) {
    res
      .status(StatusCodes.UNAUTHORIZED)
      .json(ResponseData.error(StatusCodes.UNAUTHORIZED, 'Unauthorized'));
    return;
  }

  res.locals.user = payload;

  next();
};

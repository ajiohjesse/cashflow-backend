import { APP_CONFIG } from '@/config/app.config';
import { env } from '@/config/env.config';
import { APIErrors } from '@/libraries/error.lib';
import { RequestValidator } from '@/libraries/request.lib';
import { ResponseData } from '@/libraries/response.lib';
import { TokenService } from '@/libraries/token.lib';
import type { RequestHandler } from 'express';
import { StatusCodes } from 'http-status-codes';
import type { AuthService } from './auth.service';
import {
  insertUserSchema,
  loginUserSchema,
  type RefreshUserDTO,
  type SelectUserDTO,
} from './auth.validators';

export class AuthController {
  constructor(private service: AuthService) {
    this.service = service;
  }

  register: RequestHandler = async (req, res) => {
    const body = RequestValidator.validateBody(req.body, insertUserSchema);
    const existingUser = await this.service.getUser({ email: body.email });

    if (existingUser) {
      res.status(StatusCodes.CONFLICT).json(
        ResponseData.error(
          StatusCodes.CONFLICT,
          'User with this email already exists',
          {
            email: body.email,
          }
        )
      );
      return;
    }

    const user = await this.service.register(body);
    const accessToken = TokenService.generateAccessToken({
      userId: user.id,
      issuedVia: 'login',
    });
    const refreshToken = TokenService.generateRefreshToken({
      userId: user.id,
    });

    res
      .status(StatusCodes.CREATED)
      .cookie(APP_CONFIG.REFRESH_COOKIE_NAME, refreshToken, {
        httpOnly: true,
        sameSite: 'lax',
        secure: env.isProduction,
        maxAge: APP_CONFIG.REFRESH_TOKEN_TTL_SECONDS * 1000,
      })
      .json(
        ResponseData.success<SelectUserDTO & { accessToken: string }>(
          StatusCodes.CREATED,
          'Registration successfull',
          { ...user, accessToken }
        )
      );
  };

  login: RequestHandler = async (req, res) => {
    const body = RequestValidator.validateBody(req.body, loginUserSchema);
    const user = await this.service.login(body);
    const accessToken = TokenService.generateAccessToken({
      userId: user.id,
      issuedVia: 'login',
    });
    const refreshToken = TokenService.generateRefreshToken({
      userId: user.id,
    });

    res
      .status(StatusCodes.OK)
      .cookie(APP_CONFIG.REFRESH_COOKIE_NAME, refreshToken, {
        httpOnly: true,
        sameSite: 'lax',
        secure: env.isProduction,
        maxAge: APP_CONFIG.REFRESH_TOKEN_TTL_SECONDS * 1000,
      })
      .json(
        ResponseData.success<SelectUserDTO & { accessToken: string }>(
          StatusCodes.OK,
          'Login successfull',
          { ...user, accessToken }
        )
      );
  };

  googleAuth: RequestHandler = async () => {};

  googleCallback: RequestHandler = async () => {};

  refresh: RequestHandler = async (req, res) => {
    const refreshToken = req.cookies[APP_CONFIG.REFRESH_COOKIE_NAME];
    if (!refreshToken) {
      res
        .status(StatusCodes.UNAUTHORIZED)
        .json(
          ResponseData.error(StatusCodes.UNAUTHORIZED, 'Missing refresh cookie')
        );
      return;
    }

    const refreshTokenPayload = TokenService.verifyRefreshToken(refreshToken);
    if (!refreshTokenPayload) {
      res
        .status(StatusCodes.UNAUTHORIZED)
        .json(
          ResponseData.error(StatusCodes.UNAUTHORIZED, 'Invalid refresh token')
        );
      return;
    }

    const accessToken = TokenService.generateAccessToken({
      userId: refreshTokenPayload.userId,
      issuedVia: 'refresh',
    });

    const newRefreshToken = TokenService.generateRefreshToken({
      userId: refreshTokenPayload.userId,
    });

    res
      .status(StatusCodes.OK)
      .cookie(APP_CONFIG.REFRESH_COOKIE_NAME, newRefreshToken, {
        httpOnly: true,
        sameSite: 'lax',
        secure: env.isProduction,
        maxAge: APP_CONFIG.REFRESH_TOKEN_TTL_SECONDS,
      })
      .json(
        ResponseData.success<RefreshUserDTO>(
          StatusCodes.OK,
          'Refresh successfull',
          { ...refreshTokenPayload, accessToken }
        )
      );
  };

  getProfile: RequestHandler = async (_req, res) => {
    if (!res.locals.user) {
      throw APIErrors.authenticationError();
    }

    const userId = res.locals.user.userId;
    const user = await this.service.getUser({ id: userId });

    if (!user) {
      throw APIErrors.notFoundError();
    }

    res
      .status(StatusCodes.OK)
      .json(
        ResponseData.success<SelectUserDTO>(
          StatusCodes.OK,
          'Profile retrieved successfully',
          user
        )
      );
  };

  logout: RequestHandler = async (_req, res) => {
    res.clearCookie(APP_CONFIG.REFRESH_COOKIE_NAME);
    res
      .status(StatusCodes.OK)
      .json(ResponseData.success(StatusCodes.OK, 'Logout successfull'));
  };
}

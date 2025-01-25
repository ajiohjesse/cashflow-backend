import { APP_CONFIG } from '@/config/app.config';
import { env } from '@/config/env.config';
import { APIErrors } from '@/libraries/error.lib';
import { logger } from '@/libraries/logger.lib';
import { googleOauthClient } from '@/libraries/oauth';
import { RequestValidator } from '@/libraries/request.lib';
import { ResponseData } from '@/libraries/response.lib';
import { TokenService } from '@/libraries/token.lib';
import { generateCodeVerifier, generateState } from 'arctic';
import type { RequestHandler } from 'express';
import { StatusCodes } from 'http-status-codes';
import type { AuthService } from './auth.service';
import {
  forgotPasswordSchema,
  insertUserSchema,
  loginUserSchema,
  OauthQuerySchema,
  resetPasswordSchema,
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

  googleAuth: RequestHandler = async (_req, res) => {
    const codeVerifier = generateCodeVerifier();
    const state = generateState();
    const url = googleOauthClient.createAuthorizationURL(state, codeVerifier, [
      'profile',
      'email',
    ]);

    res.cookie(APP_CONFIG.OAUTH_STATE_COOKIE_NAME, state, {
      secure: env.isProduction,
      path: '/',
      sameSite: 'lax',
      httpOnly: true,
      maxAge: APP_CONFIG.OAUTH_COOKIE_TTL_SECONDS * 1000,
    });

    res.cookie(APP_CONFIG.OAUTH_CODE_VERIFIER_COOKIE_NAME, codeVerifier, {
      secure: env.isProduction,
      path: '/',
      sameSite: 'lax',
      httpOnly: true,
      maxAge: APP_CONFIG.OAUTH_COOKIE_TTL_SECONDS * 1000,
    });

    res.redirect(url.toString());
  };

  googleCallback: RequestHandler = async (req, res) => {
    const { code, state } = RequestValidator.validateQuery(
      req.query,
      OauthQuerySchema
    );

    const storedState = req.cookies[APP_CONFIG.OAUTH_STATE_COOKIE_NAME];
    const codeVerifier =
      req.cookies[APP_CONFIG.OAUTH_CODE_VERIFIER_COOKIE_NAME];

    if (!storedState || !codeVerifier || state !== storedState) {
      res
        .status(StatusCodes.BAD_REQUEST)
        .json(
          ResponseData.error(StatusCodes.BAD_REQUEST, 'Invalid Oauth Request')
        );
      return;
    }

    try {
      const tokens = await googleOauthClient.validateAuthorizationCode(
        code,
        codeVerifier
      );

      logger.info('Google tokens validated', tokens);

      const results = await fetch(
        'https://openidconnect.googleapis.com/v1/userinfo',
        {
          headers: {
            Authorization: `Bearer ${tokens.accessToken()}`,
          },
        }
      );

      const googleUser = (await results.json()) as {
        sub: string;
        name: string;
        given_name: string;
        family_name: string;
        picture: string;
        email: string;
        email_verified: boolean;
        locale: string;
      };

      logger.info('Google user logged in', googleUser);

      const user = await this.service.loginGoogleUser({
        email: googleUser.email,
        fullName: googleUser.given_name + ' ' + googleUser.family_name,
        googleId: googleUser.sub,
      });
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
    } catch (error) {
      logger.error(error);
      res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json(
          ResponseData.error(
            StatusCodes.INTERNAL_SERVER_ERROR,
            'Unable to sign-in with google'
          )
        );
    }
  };

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
        maxAge: APP_CONFIG.REFRESH_TOKEN_TTL_SECONDS * 1000,
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

  forgotPassword: RequestHandler = async (req, res) => {
    const { email } = RequestValidator.validateBody(
      req.body,
      forgotPasswordSchema
    );
    await this.service.forgotPassword({ email });
    res
      .status(StatusCodes.OK)
      .json(
        ResponseData.success(
          StatusCodes.OK,
          'Password reset link sent to your email'
        )
      );
  };

  resetPassword: RequestHandler = async (req, res) => {
    const { password, token } = RequestValidator.validateBody(
      req.body,
      resetPasswordSchema
    );
    await this.service.resetPassword({ password, token });
    res
      .status(StatusCodes.OK)
      .json(
        ResponseData.success(StatusCodes.OK, 'Password reset successfully')
      );
  };
}

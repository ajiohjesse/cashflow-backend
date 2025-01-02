import { APP_CONFIG } from '@/config/app.config';
import { env } from '@/config/env.config';
import jwt from 'jsonwebtoken';

export interface AccessTokenPayload {
  userId: string;
  issuedVia: 'login' | 'refresh';
}

export interface RefreshTokenPayload {
  userId: string;
}

export class TokenService {
  static generateAccessToken(payload: AccessTokenPayload): string {
    return jwt.sign(payload, env.ACCESS_TOKEN_SECRET, {
      expiresIn: APP_CONFIG.ACCESS_TOKEN_TTL_SECONDS,
    });
  }

  static verifyAccessToken(accessToken: string): AccessTokenPayload | null {
    try {
      return jwt.verify(
        accessToken,
        env.ACCESS_TOKEN_SECRET
      ) as AccessTokenPayload;
    } catch (error) {
      return null;
    }
  }

  static generateRefreshToken(payload: RefreshTokenPayload): string {
    return jwt.sign(payload, env.REFRESH_TOKEN_SECRET, {
      expiresIn: APP_CONFIG.REFRESH_TOKEN_TTL_SECONDS,
    });
  }

  static verifyRefreshToken(refreshToken: string): RefreshTokenPayload | null {
    try {
      return jwt.verify(
        refreshToken,
        env.REFRESH_TOKEN_SECRET
      ) as RefreshTokenPayload;
    } catch (error) {
      return null;
    }
  }
}

import { logger } from '@/libraries/logger.lib';
import { ResponseData } from '@/libraries/response.lib';
import rateLimit from 'express-rate-limit';
import { StatusCodes } from 'http-status-codes';
import { z } from 'zod';

export const forgotPasswordLimiter = rateLimit({
  windowMs: 6 * 60 * 60 * 1000, // 6 hour window
  limit: 3, // Limit each email to 3 requests per windowMs
  skipFailedRequests: true,
  keyGenerator: req => {
    if (req.body && req.body.email) {
      const result = z.string().email().safeParse(req.body.email);
      if (result.success) {
        return result.data.toLowerCase().trim(); // Normalize email
      }
    }
    return (
      req.ip?.toString() || req.socket.remoteAddress?.toString() || 'unknown-ip'
    );
  },
  handler: (req, res) => {
    logger.warn(`Rate limit exceeded for email: ${req.body.email || req.ip}`);
    res
      .status(StatusCodes.TOO_MANY_REQUESTS)
      .json(
        ResponseData.error(
          StatusCodes.TOO_MANY_REQUESTS,
          'Too many reset password attempts. Please try again later.'
        )
      );
  },
  standardHeaders: true, // Include rate limit info in response headers
  legacyHeaders: false, // Disable deprecated X-RateLimit-* headers
});

export const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes).
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    logger.warn(`Rate limit exceeded for ip: ${req.ip}`);
    res
      .status(StatusCodes.TOO_MANY_REQUESTS)
      .json(
        ResponseData.error(
          StatusCodes.TOO_MANY_REQUESTS,
          'Too attempts. Please try again later.'
        )
      );
  },
});

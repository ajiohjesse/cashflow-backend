import { type Response } from 'express';

type ResponseData<T> = T | null;

type PaginatedData<TArrayKey extends string, T> = {
  [key in TArrayKey]: T[];
} & {
  page: number;
  perPage: number;
  totalItems: number;
  totalPages: number;
};

export const ResponseHandler = {
  /**
   * Sets a refresh token cookie in the response.
   * @param res - Express Response object
   * @param token - Refresh token
   * @returns void
   */
  setRefreshTokenCookie(res: Response, token: string) {
    res.cookie('_refresh', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 1000 * 60 * 60 * 24 * 7,
    });
  },

  /**
   * Sends a success response.
   * @param res - Express Response object
   * @param statusCode - HTTP status code
   * @param message - Success message
   * @param data - Response data of generic type T (default: null)
   * @returns void
   */
  success<T extends Record<string, unknown>>(
    res: Response,
    statusCode: number,
    message: string,
    data: T | null = null
  ) {
    res.status(statusCode).json({
      success: true,
      statusCode,
      message,
      data,
    });
  },

  /**
   * Sends an error response.
   * @param res - Express Response object
   * @param statusCode - HTTP status code
   * @param message - Error message
   * @param data - Additional error details of generic type T (default: null)
   * @returns void
   */
  error<T extends Record<string, unknown>>(
    res: Response,
    message: string,
    statusCode: number = 500,
    data: T | null = null
  ) {
    res.status(statusCode).json({
      success: false,
      statusCode,
      message,
      data,
    });
  },

  /**
   * Sends a paginated response with a dynamic key for the array of items.
   * @param res - Express Response object
   * @param statusCode - HTTP status code
   * @param message - Success message
   * @param paginatedData - Paginated data of generic type T with a dynamic array key
   * @returns void
   */
  paginated<TArrayKey extends string, T>(
    res: Response,
    statusCode: number,
    message: string,
    paginatedData: PaginatedData<TArrayKey, T>
  ) {
    res.status(statusCode).json({
      success: true,
      statusCode,
      message,
      data: paginatedData,
    });
  },
} as const;

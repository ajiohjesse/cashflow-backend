export const APP_CONFIG = {
  APP_NAME: 'Cashflow API',
  APP_DESCRIPTION: 'API for tracking expenses',
  APP_VERSION: '0.0.1',
  REFRESH_COOKIE_NAME: 'cashflow_refresh',
  REFRESH_TOKEN_TTL_SECONDS: 60 * 60 * 24 * 30, // 30 days
  ACCESS_TOKEN_TTL_SECONDS: 60 * 15, // 15 minutes
} as const;

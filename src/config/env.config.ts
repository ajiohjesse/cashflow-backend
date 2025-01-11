/* eslint-disable no-process-env */
import dotenv from 'dotenv';
import { cleanEnv, num, port, str, testOnly } from 'envalid';

dotenv.config({
  path: `.env.${process.env.NODE_ENV || 'development'}`,
});

export const env = cleanEnv(process.env, {
  NODE_ENV: str({
    devDefault: testOnly('test'),
    choices: ['development', 'production', 'test'],
  }),
  PORT: port({ devDefault: testOnly(3000) }),
  CORS_ORIGIN: str({ devDefault: testOnly('http://localhost:3001') }),
  RATE_LIMIT_MAX_REQUESTS: num({ devDefault: testOnly(1000) }),
  RATE_LIMIT_WINDOW_MS: num({ devDefault: testOnly(1000) }),
  DATABASE_URL: str({
    devDefault: testOnly(
      'postgresql://postgres:jessejas@127.0.0.1:5432/cashflow'
    ),
  }),
  ACCESS_TOKEN_SECRET: str(),
  REFRESH_TOKEN_SECRET: str(),
  OPENAI_API_KEY: str(),
  GOOGLE_AI_API_KEY: str(),
});

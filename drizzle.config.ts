/* eslint-disable no-process-env */
import dotenv from 'dotenv';
import { defineConfig } from 'drizzle-kit';

dotenv.config({
  path: `.env.${process.env.NODE_ENV || 'development'}`,
});

export default defineConfig({
  schema: './src/database/schemas.ts',
  out: './src/database/migrations',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
  casing: 'snake_case',
  verbose: true,
  strict: true,
});

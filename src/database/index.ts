import { env } from '@/config/env.config';
import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from './schemas';

export const db = drizzle(env.DATABASE_URL, {
  casing: 'snake_case',
  schema,
  logger: !env.isProduction,
});

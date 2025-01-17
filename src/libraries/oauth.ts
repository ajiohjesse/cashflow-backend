import { env } from '@/config/env.config';
import { Google } from 'arctic';

export const googleOauthClient = new Google(
  env.GOOGLE_CLIENT_ID,
  env.GOOGLE_CLIENT_SECRET,
  env.CORS_ORIGIN + '/oauth'
);

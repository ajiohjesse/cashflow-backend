import 'express';
import type { AccessTokenPayload } from './libraries/token.lib';

declare global {
  namespace Express {
    interface Locals {
      user?: AccessTokenPayload;
    }
  }
}

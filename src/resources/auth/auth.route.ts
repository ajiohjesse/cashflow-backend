import { authHandler } from '@/middleware/auth.middleware';
import { Router } from 'express';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

const route = Router();
export { route as authRoute };

const authService = new AuthService();
const authController = new AuthController(authService);

route.post('/v1/register', authController.register);
route.post('/v1/login', authController.login);
route.get('/v1/google', authController.googleAuth);
route.get('/v1/google/callback', authController.googleCallback);
route.get('/v1/refresh', authController.refresh);
route.post('/v1/logout', authController.logout);
route.get('/v1/profile', authHandler, authController.getProfile);
route.post('/v1/forgot-password', authController.forgotPassword);
route.post('/v1/reset-password', authController.resetPassword);

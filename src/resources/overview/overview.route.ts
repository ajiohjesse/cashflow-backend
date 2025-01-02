import { authHandler } from '@/middleware/auth.middleware';
import { Router } from 'express';
import { OverviewController } from './overview.controller';
import { OverviewService } from './overview.service';

const route = Router();
export { route as overviewRoute };

const overviewService = new OverviewService();
const overviewController = new OverviewController(overviewService);

route.get('/v1/overview', authHandler, overviewController.getOverview);

import type { OpenAPIRegistry } from '@asteasolutions/zod-to-openapi';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';
import 'express-async-errors';
import helmet from 'helmet';
import { env } from './config/env.config';
import { setupApiDocs } from './libraries/docs.lib';
import { errorHandler } from './middleware/error.middleware';
import { logHandler } from './middleware/logger.middleware';
import { notFoundHandler } from './middleware/notfound.middleware';
import { globalLimiter } from './middleware/ratelimit.middleware';
import { authRegisty } from './resources/auth/auth.registry';
import { authRoute } from './resources/auth/auth.route';
import { categoryRegistry } from './resources/category/category.registry';
import { categoryRoute } from './resources/category/category.route';
import { healthRegistry } from './resources/health/health.registry';
import { healthRoute } from './resources/health/health.route';
import { overviewRegistry } from './resources/overview/overview.registry';
import { overviewRoute } from './resources/overview/overview.route';
import { transactionRegistry } from './resources/transaction/transaction.registry';
import { transactionRoute } from './resources/transaction/transaction.route';

const app = express();

app.use(helmet());
app.use(
  cors({
    origin: env.CORS_ORIGIN,
    credentials: true,
  })
);
app.use(cookieParser());
app.use(express.json());
app.use(globalLimiter);
app.use(logHandler);

const routes: express.RequestHandler[] = [
  healthRoute,
  authRoute,
  overviewRoute,
  transactionRoute,
  categoryRoute,
];
const registries: OpenAPIRegistry[] = [
  healthRegistry,
  authRegisty,
  overviewRegistry,
  transactionRegistry,
  categoryRegistry,
];

setupApiDocs(app, registries);

routes.forEach(route => {
  app.use(route);
});

app.use([notFoundHandler, errorHandler]);

export { app };

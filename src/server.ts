import { app } from './app';
import { env } from './config/env.config';
import { logger } from './libraries/logger.lib';

const port = env.PORT || 8080;

const server = app.listen(port, () => {
  logger.info('Server started on port', port);
});

const onCloseSignal = () => {
  logger.info('sigint received, shutting down');
  server.close(() => {
    logger.info('server closed');
    process.exit(0);
  });
};

process.on('SIGINT', onCloseSignal);
process.on('SIGTERM', onCloseSignal);

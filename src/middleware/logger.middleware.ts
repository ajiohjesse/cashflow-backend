import { logger } from '@/libraries/logger.lib';
import type { NextFunction, Request, Response } from 'express';

export function logHandler(req: Request, res: Response, next: NextFunction) {
  const startTime = process.hrtime(); // Capture start time for response duration
  const { method, originalUrl, headers, socket } = req;
  const userAgent = headers['user-agent'] || 'Unknown';
  const ip = socket.remoteAddress || 'Unknown';
  const requestId = crypto.randomUUID();

  // Log the incoming request
  logger.log({
    message: 'Incoming Request',
    method,
    url: originalUrl,
    ip,
    userAgent,
    timestamp: new Date().toISOString(),
    requestId,
  });

  // Log the response details when the response is finished
  res.on('finish', () => {
    const [seconds, nanoseconds] = process.hrtime(startTime);
    const duration = (seconds * 1e3 + nanoseconds / 1e6).toFixed(3); // Convert to milliseconds

    logger.log({
      message: 'Response Sent',
      method,
      url: originalUrl,
      status: res.statusCode,
      statusMessage: res.statusMessage,
      ip,
      userAgent,
      duration: `${duration}ms`,
      timestamp: new Date().toISOString(),
      requestId,
    });
  });

  next();
}

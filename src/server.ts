import dns from 'dns';
try {
  dns.setDefaultResultOrder?.('ipv4first');
} catch {
  // Ignore if unsupported
}

import { app } from './app';
import { env } from './config/env';
import { logger } from './utils/logger';

const server = app.listen(env.PORT, () => {
  logger.success(`🚀 Portfolio Backend running on http://localhost:${env.PORT}`);
  logger.info(`Environment: ${env.NODE_ENV}`);
  logger.info(`Health check: http://localhost:${env.PORT}/api/health`);
  logger.info(`Projects API: http://localhost:${env.PORT}/api/projects`);
});

// Graceful Shutdown Handler
const gracefulShutdown = (signal: string) => {
  logger.warn(`Received ${signal}. Gracefully shutting down HTTP server...`);
  server.close(() => {
    logger.info('HTTP server closed successfully. Process terminated.');
    process.exit(0);
  });

  // Force close after 10s if connections fail to drain
  setTimeout(() => {
    logger.error('Could not close connections in time, forcefully shutting down');
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

process.on('unhandledRejection', (reason: unknown) => {
  logger.error('Unhandled Rejection detected:', reason);
});

process.on('uncaughtException', (error: Error) => {
  logger.error('Uncaught Exception detected:', error);
  process.exit(1);
});

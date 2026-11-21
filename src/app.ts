import express, { Application } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import { corsOptions } from './config/cors';
import { requestLogger } from './middlewares/logger.middleware';
import { apiRateLimiter } from './middlewares/rateLimiter.middleware';
import { notFoundHandler, errorHandler } from './middlewares/error.middleware';
import apiRouter from './routes';

export const createApp = (): Application => {
  const app = express();

  // 1. Security HTTP Headers
  app.use(helmet());

  // 2. CORS Handling
  app.use(cors(corsOptions));

  // 3. Request Body Parsing
  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ extended: true, limit: '1mb' }));

  // 4. Request Logging
  app.use(requestLogger);

  // 5. Rate Limiting for API routes
  app.use('/api', apiRateLimiter);

  // 6. Mount API Routes
  app.use('/api', apiRouter);

  // 7. Base Welcome Route (for /)
  app.get('/', (_req, res) => {
    res.redirect('/api');
  });

  // 8. 404 Route Not Found Handler
  app.use(notFoundHandler);

  // 9. Global Error Handler
  app.use(errorHandler);

  return app;
};

export const app = createApp();

import { Request, Response } from 'express';
import { ApiResponse } from '../utils/ApiResponse';
import { env } from '../config/env';

export const checkHealth = (_req: Request, res: Response) => {
  const memoryUsage = process.memoryUsage();

  const healthData = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: `${Math.floor(process.uptime())} seconds`,
    environment: env.NODE_ENV,
    nodeVersion: process.version,
    memory: {
      rss: `${Math.round(memoryUsage.rss / 1024 / 1024)} MB`,
      heapTotal: `${Math.round(memoryUsage.heapTotal / 1024 / 1024)} MB`,
      heapUsed: `${Math.round(memoryUsage.heapUsed / 1024 / 1024)} MB`,
    },
  };

  return res.status(200).json(ApiResponse.success(healthData, 'Portfolio Backend API is fully operational'));
};

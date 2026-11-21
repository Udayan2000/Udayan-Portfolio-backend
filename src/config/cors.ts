import { CorsOptions } from 'cors';
import { env } from './env';

// Support comma-separated frontend URLs (e.g., "http://localhost:3000, https://udayan-portfolio.vercel.app")
const configuredOrigins = (env.FRONTEND_URL || '')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

const defaultOrigins = [
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  'http://localhost:5000',
  'http://127.0.0.1:5000',
];

const allowedOrigins: string[] = Array.from(new Set([...configuredOrigins, ...defaultOrigins]));

export const corsOptions: CorsOptions = {
  origin: (origin, callback) => {
    // 1. Allow non-browser requests (e.g. mobile apps, curl, Postman, health monitors)
    if (!origin) {
      return callback(null, true);
    }

    // 2. Allow all in development mode
    if (env.NODE_ENV === 'development') {
      return callback(null, true);
    }

    // 3. Exact match against allowed origins
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    // 4. Match any Vercel deployment preview or production domain (*.vercel.app)
    if (origin.endsWith('.vercel.app')) {
      return callback(null, true);
    }

    return callback(new Error(`CORS policy violation: Origin '${origin}' is not allowed`));
  },
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  credentials: true,
  maxAge: 86400, // 24 hours preflight cache
};

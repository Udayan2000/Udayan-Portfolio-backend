import dotenv from 'dotenv';
import { z } from 'zod';
import { logger } from '../utils/logger';

dotenv.config();

const envSchema = z.object({
  PORT: z.string().default('5000').transform((val) => parseInt(val, 10)),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  FRONTEND_URL: z.string().default('http://localhost:3000'),
  RATE_LIMIT_WINDOW_MINUTES: z.string().default('15').transform((val) => parseInt(val, 10)),
  RATE_LIMIT_MAX_REQUESTS: z.string().default('100').transform((val) => parseInt(val, 10)),
  CONTACT_RATE_LIMIT_MAX: z.string().default('10').transform((val) => parseInt(val, 10)),
  CHAT_RATE_LIMIT_MAX: z.string().default('30').transform((val) => parseInt(val, 10)),

  // Gemini AI Agent
  GEMINI_API_KEY: z.string().default(''),
  GEMINI_MODEL: z.string().default('gemini-3.5-flash-lite'),

  // Transactional Email API (Resend - Recommended for Cloud Production)
  RESEND_API_KEY: z.string().optional(),

  // SMTP Email
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.string().default('587').transform((val) => parseInt(val, 10)),
  SMTP_SECURE: z.string().default('false').transform((val) => val === 'true'),
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),
  CONTACT_RECEIVER_EMAIL: z.string().email().default('ghosh.udayan2000@gmail.com'),

  // WhatsApp via CallMeBot (Optional)
  WHATSAPP_PHONE: z.string().optional(),
  WHATSAPP_CALLMEBOT_API_KEY: z.string().optional(),
});

const parseEnv = () => {
  const result = envSchema.safeParse(process.env);

  if (!result.success) {
    logger.error('Invalid environment variables detected:', result.error.format());
    throw new Error('Invalid environment configuration');
  }

  return result.data;
};

export const env = parseEnv();

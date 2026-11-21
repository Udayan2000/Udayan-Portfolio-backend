import rateLimit from 'express-rate-limit';
import { env } from '../config/env';
import { ApiError } from '../utils/ApiError';

// General API Rate Limiter
export const apiRateLimiter = rateLimit({
  windowMs: env.RATE_LIMIT_WINDOW_MINUTES * 60 * 1000,
  max: env.RATE_LIMIT_MAX_REQUESTS,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_req, _res, next) => {
    next(
      ApiError.tooManyRequests(
        `Too many requests from this IP. Please try again after ${env.RATE_LIMIT_WINDOW_MINUTES} minutes.`
      )
    );
  },
});

// Stricter Rate Limiter for Contact Form Submissions (anti-spam)
export const contactRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: env.CONTACT_RATE_LIMIT_MAX, // default 10 submissions per 15 minutes per IP
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_req, _res, next) => {
    next(
      ApiError.tooManyRequests(
        'Too many contact inquiries submitted from this IP. Please wait 15 minutes before sending another message.'
      )
    );
  },
});

// Chat Rate Limiter (Protects Gemini API quota & prevents bot floods)
export const chatRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: env.CHAT_RATE_LIMIT_MAX, // default 30 messages per 15 minutes per IP
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_req, _res, next) => {
    next(
      ApiError.tooManyRequests(
        'You have sent messages too quickly. Please pause for a few minutes before typing again.'
      )
    );
  },
});

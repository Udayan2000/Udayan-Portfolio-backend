import { Router } from 'express';
import {
  sendMessage,
  getSessionHistory,
  toggleTakeover,
  listSessions,
} from '../controllers/chat.controller';
import { chatRateLimiter } from '../middlewares/rateLimiter.middleware';

const router = Router();

// POST /api/chat/message - Send client message and get AI response
router.post('/message', chatRateLimiter, sendMessage);

// GET /api/chat/history/:sessionId - Retrieve conversation history for session
router.get('/history/:sessionId', getSessionHistory);

// POST /api/chat/takeover - Toggle human takeover or send human message
router.post('/takeover', toggleTakeover);

// GET /api/chat/sessions - List active sessions for admin review
router.get('/sessions', listSessions);

export default router;

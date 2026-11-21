import { Router } from 'express';
import { submitInquiry, getSubmissions } from '../controllers/contact.controller';
import { validateBody } from '../middlewares/validate.middleware';
import { contactInquirySchema } from '../validations/contact.validation';
import { contactRateLimiter } from '../middlewares/rateLimiter.middleware';

const router = Router();

// POST /api/contact - Submit project inquiry (rate-limited and validated)
router.post('/', contactRateLimiter, validateBody(contactInquirySchema), submitInquiry);

// GET /api/contact - List all inquiries
router.get('/', getSubmissions);

export default router;

import { Router } from 'express';
import { checkHealth } from '../controllers/health.controller';

const router = Router();

// GET /api/health - System status, uptime and health metrics
router.get('/', checkHealth);

export default router;

import { Router } from 'express';
import { getServices, getService } from '../controllers/service.controller';

const router = Router();

// GET /api/services - Get all 6 core client service verticals
router.get('/', getServices);

// GET /api/services/:id - Get single service details
router.get('/:id', getService);

export default router;

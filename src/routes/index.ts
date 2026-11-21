import { Router } from 'express';
import healthRoutes from './health.routes';
import contactRoutes from './contact.routes';
import projectRoutes from './project.routes';
import serviceRoutes from './service.routes';
import chatRoutes from './chat.routes';

const router = Router();

// Root API welcome endpoint
router.get('/', (_req, res) => {
  res.status(200).json({
    name: 'Portfolio Backend API',
    version: '1.0.0',
    developer: 'Udayan Ghosh',
    endpoints: {
      health: '/api/health',
      projects: '/api/projects',
      projectCategories: '/api/projects/categories',
      services: '/api/services',
      contact: '/api/contact (POST)',
      chat: {
        message: '/api/chat/message (POST)',
        history: '/api/chat/history/:sessionId (GET)',
        takeover: '/api/chat/takeover (POST)',
        sessions: '/api/chat/sessions (GET)',
      },
    },
    status: 'online',
  });
});

// Sub-routers
router.use('/health', healthRoutes);
router.use('/contact', contactRoutes);
router.use('/projects', projectRoutes);
router.use('/services', serviceRoutes);
router.use('/chat', chatRoutes);

export default router;

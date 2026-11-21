import { Router } from 'express';
import { getProjects, getProject, getCategories } from '../controllers/project.controller';

const router = Router();

// GET /api/projects - Get all projects (supports ?category=..., ?search=..., ?featured=...)
router.get('/', getProjects);

// GET /api/projects/categories - Get project category tabs & counts
router.get('/categories', getCategories);

// GET /api/projects/:id - Get single project by ID or slug
router.get('/:id', getProject);

export default router;

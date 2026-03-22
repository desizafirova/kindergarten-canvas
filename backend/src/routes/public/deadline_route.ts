import { Router } from 'express';
import { getPublicDeadlines, getPublicDeadlineById } from '../../controllers/public/deadline_controller';

const router = Router();

// GET /api/v1/public/admission-deadlines - List published deadlines (no authentication)
router.get('/', getPublicDeadlines);

// GET /api/v1/public/admission-deadlines/:id - Get single published deadline by ID
router.get('/:id', getPublicDeadlineById);

export default router;

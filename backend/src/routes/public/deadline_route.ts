import { Router } from 'express';
import { getPublicDeadlines } from '../../controllers/public/deadline_controller';

const router = Router();

// GET /api/v1/public/admission-deadlines - List published deadlines (no authentication)
router.get('/', getPublicDeadlines);

export default router;

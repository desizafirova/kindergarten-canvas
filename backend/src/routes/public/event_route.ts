import { Router } from 'express';
import { getPublicEvents, getPublicEventById } from '../../controllers/public/event_controller';

const router = Router();

// GET /api/v1/public/events - List published events (no authentication)
router.get('/', getPublicEvents);

// GET /api/v1/public/events/:id - Get single published event by ID
router.get('/:id', getPublicEventById);

export default router;

import { Router } from 'express';
import { getPublicEvents } from '../../controllers/public/event_controller';

const router = Router();

// GET /api/v1/public/events - List published events (no authentication)
router.get('/', getPublicEvents);

export default router;

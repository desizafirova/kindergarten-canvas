import { Router } from 'express';
import { getPublishedNews, getPublishedNewsById } from '../../controllers/public/news_controller';

const router = Router();

// GET /api/v1/public/news - List all published news (no authentication)
router.get('/', getPublishedNews);

// GET /api/v1/public/news/:id - Get single published news item (no authentication)
router.get('/:id', getPublishedNewsById);

export default router;

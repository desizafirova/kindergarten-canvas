import { Router } from 'express';
import auth from '@middlewares/auth/authenticate';
import { validate } from '@middlewares/validate_schema/validade_schema';
import ctrlNews from '@controllers/admin/news_controller';
import { createNews, updateNews, getNewsById, getNewsList } from '@schemas/news_schema';

const router = Router();

// GET /api/admin/v1/news - List all news (with optional status filter)
router.get('/', auth('jwt-user'), validate(getNewsList), ctrlNews.getAll);

// GET /api/admin/v1/news/:id - Get single news item
router.get('/:id', auth('jwt-user'), validate(getNewsById), ctrlNews.getOne);

// POST /api/admin/v1/news - Create new news item
router.post('/', auth('jwt-user'), validate(createNews), ctrlNews.create);

// PUT /api/admin/v1/news/:id - Update news item
router.put('/:id', auth('jwt-user'), validate(updateNews), ctrlNews.update);

// DELETE /api/admin/v1/news/:id - Delete news item
router.delete('/:id', auth('jwt-user'), validate(getNewsById), ctrlNews.remove);

export default router;

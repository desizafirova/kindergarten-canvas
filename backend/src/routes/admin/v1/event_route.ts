import { Router } from 'express';
import auth from '@middlewares/auth/authenticate';
import { validate } from '@middlewares/validate_schema/validade_schema';
import ctrlEvent from '@controllers/admin/event_controller';
import { createEvent, updateEvent, getEventById, getEventList } from '@schemas/event_schema';

const router = Router();

// GET /api/admin/v1/events - List all events (with optional status/upcoming filters)
router.get('/', auth('jwt-user'), validate(getEventList), ctrlEvent.getAll);

// GET /api/admin/v1/events/:id - Get single event
router.get('/:id', auth('jwt-user'), validate(getEventById), ctrlEvent.getOne);

// POST /api/admin/v1/events - Create new event
router.post('/', auth('jwt-user'), validate(createEvent), ctrlEvent.create);

// PUT /api/admin/v1/events/:id - Update event
router.put('/:id', auth('jwt-user'), validate(updateEvent), ctrlEvent.update);

// DELETE /api/admin/v1/events/:id - Delete event
router.delete('/:id', auth('jwt-user'), validate(getEventById), ctrlEvent.remove);

export default router;

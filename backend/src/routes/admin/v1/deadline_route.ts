import { Router } from 'express';
import auth from '@middlewares/auth/authenticate';
import { validate } from '@middlewares/validate_schema/validade_schema';
import ctrlDeadline from '@controllers/admin/deadline_controller';
import {
    createDeadline,
    updateDeadline,
    getDeadlineById,
    getDeadlineList,
} from '@schemas/deadline_schema';

const router = Router();

// GET /api/admin/v1/admission-deadlines
router.get('/', auth('jwt-user'), validate(getDeadlineList), ctrlDeadline.getAll);

// GET /api/admin/v1/admission-deadlines/:id
router.get('/:id', auth('jwt-user'), validate(getDeadlineById), ctrlDeadline.getOne);

// POST /api/admin/v1/admission-deadlines
router.post('/', auth('jwt-user'), validate(createDeadline), ctrlDeadline.create);

// PUT /api/admin/v1/admission-deadlines/:id
router.put('/:id', auth('jwt-user'), validate(updateDeadline), ctrlDeadline.update);

// DELETE /api/admin/v1/admission-deadlines/:id
router.delete('/:id', auth('jwt-user'), validate(getDeadlineById), ctrlDeadline.remove);

export default router;

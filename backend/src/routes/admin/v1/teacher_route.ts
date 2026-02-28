import { Router } from 'express';
import auth from '@middlewares/auth/authenticate';
import { validate } from '@middlewares/validate_schema/validade_schema';
import ctrlTeacher from '@controllers/admin/teacher_controller';
import { createTeacher, updateTeacher, getTeacherById, getTeacherList } from '@schemas/teacher_schema';

const router = Router();

// GET /api/admin/v1/teachers - List all teachers (with optional status filter)
router.get('/', auth('jwt-user'), validate(getTeacherList), ctrlTeacher.getAll);

// GET /api/admin/v1/teachers/:id - Get single teacher
router.get('/:id', auth('jwt-user'), validate(getTeacherById), ctrlTeacher.getOne);

// POST /api/admin/v1/teachers - Create new teacher
router.post('/', auth('jwt-user'), validate(createTeacher), ctrlTeacher.create);

// PUT /api/admin/v1/teachers/:id - Update teacher
router.put('/:id', auth('jwt-user'), validate(updateTeacher), ctrlTeacher.update);

// DELETE /api/admin/v1/teachers/:id - Delete teacher
router.delete('/:id', auth('jwt-user'), validate(getTeacherById), ctrlTeacher.remove);

export default router;

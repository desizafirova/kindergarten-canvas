import { Router } from 'express';
import { getPublishedTeachers } from '../../controllers/public/teacher_controller';

const router = Router();

// GET /api/v1/public/teachers - List all published teachers (no authentication)
router.get('/', getPublishedTeachers);

export default router;

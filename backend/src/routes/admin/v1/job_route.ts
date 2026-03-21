import { Router } from 'express';
import auth from '@middlewares/auth/authenticate';
import { validate } from '@middlewares/validate_schema/validade_schema';
import ctrlJob from '@controllers/admin/job_controller';
import { createJob, updateJob, getJobById, getJobList } from '@schemas/job_schema';

const router = Router();

// GET /api/admin/v1/jobs - List all jobs (with optional status/isActive filters)
router.get('/', auth('jwt-user'), validate(getJobList), ctrlJob.getAll);

// GET /api/admin/v1/jobs/:id - Get single job
router.get('/:id', auth('jwt-user'), validate(getJobById), ctrlJob.getOne);

// POST /api/admin/v1/jobs - Create new job
router.post('/', auth('jwt-user'), validate(createJob), ctrlJob.create);

// PUT /api/admin/v1/jobs/:id - Update job
router.put('/:id', auth('jwt-user'), validate(updateJob), ctrlJob.update);

// DELETE /api/admin/v1/jobs/:id - Delete job
router.delete('/:id', auth('jwt-user'), validate(getJobById), ctrlJob.remove);

export default router;

import { Router } from 'express';
import { getPublicJobs, getPublicJob } from '../../controllers/public/job_controller';

const router = Router();

// GET /api/v1/public/jobs - List published active jobs (no authentication)
router.get('/', getPublicJobs);

// GET /api/v1/public/jobs/:id - Get single published active job (no authentication)
router.get('/:id', getPublicJob);

export default router;

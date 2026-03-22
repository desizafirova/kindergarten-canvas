import { Router } from 'express';
import { getHomepageData } from '../../controllers/public/homepage_controller';

const router = Router();

// GET /api/v1/public/homepage - Aggregated homepage data (no authentication)
router.get('/', getHomepageData);

export default router;

import { Router } from 'express';
import { getPublicGalleries, getPublicGallery } from '../../controllers/public/gallery_controller';

const router = Router();

// GET /api/v1/public/galleries - List published galleries with ≥1 image (no auth)
router.get('/', getPublicGalleries);

// GET /api/v1/public/galleries/:id - Get single published gallery (no auth)
router.get('/:id', getPublicGallery);

export default router;

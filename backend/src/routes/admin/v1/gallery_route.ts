import { Router } from 'express';
import auth from '@middlewares/auth/authenticate';
import { validate } from '@middlewares/validate_schema/validade_schema';
import ctrlGallery from '@controllers/admin/gallery_controller';
import {
    createGallery,
    updateGallery,
    getGalleryById,
    getGalleryList,
    addGalleryImage,
    deleteGalleryImage,
    reorderGalleryImages,
} from '@schemas/gallery_schema';
import upload from '@config/multer.config';

const router = Router();

// GET /api/admin/v1/galleries - List all galleries (with optional status filter)
router.get('/', auth('jwt-user'), validate(getGalleryList), ctrlGallery.getAll);

// GET /api/admin/v1/galleries/:id - Get single gallery with images
router.get('/:id', auth('jwt-user'), validate(getGalleryById), ctrlGallery.getOne);

// POST /api/admin/v1/galleries - Create new gallery
router.post('/', auth('jwt-user'), validate(createGallery), ctrlGallery.create);

// PUT /api/admin/v1/galleries/:id - Update gallery
router.put('/:id', auth('jwt-user'), validate(updateGallery), ctrlGallery.update);

// DELETE /api/admin/v1/galleries/:id - Delete gallery (cascade deletes images)
router.delete('/:id', auth('jwt-user'), validate(getGalleryById), ctrlGallery.remove);

// POST /api/admin/v1/galleries/:id/images - Upload single image to gallery
router.post('/:id/images', auth('jwt-user'), validate(addGalleryImage), upload.single('image'), ctrlGallery.addImage);

// PUT /api/admin/v1/galleries/:id/images/reorder - Reorder gallery images (BEFORE DELETE to avoid routing conflict)
router.put('/:id/images/reorder', auth('jwt-user'), validate(reorderGalleryImages), ctrlGallery.reorderImages);

// DELETE /api/admin/v1/galleries/:id/images/:imageId - Remove image from gallery
router.delete('/:id/images/:imageId', auth('jwt-user'), validate(deleteGalleryImage), ctrlGallery.removeImage);

export default router;

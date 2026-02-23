import { Router } from 'express';
import auth from '@middlewares/auth/authenticate';
import upload from '@config/multer.config';
import ctrlUpload from '@controllers/admin/upload_controller';

const router = Router();

// POST /api/admin/v1/upload - Upload single image
router.post(
  '/',
  auth('jwt-user'),           // 1. Authentication first
  upload.single('file'),      // 2. Multer handles multipart/form-data (populates req.file)
  ctrlUpload.uploadImage      // 3. Controller validates and uploads to Cloudinary
);

export default router;

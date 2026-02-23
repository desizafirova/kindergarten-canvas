import { Request, Response, NextFunction } from 'express';
import cloudinaryUploadService from '@services/cloudinary/cloudinary_upload_service';
import httpMsg from '@utils/http_messages/http_msg';
import logger from '@utils/logger/winston/logger';

const uploadImage = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // 1. Check if file exists (multer populates req.file)
    if (!req.file) {
      const error = httpMsg.http400('Моля, изберете файл за качване', 'ERROR_NO_FILE');
      return res.status(error.httpStatusCode).json(error.data);
    }

    // 2. Validate file type (double-check, multer fileFilter already ran)
    const allowedMimeTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedMimeTypes.includes(req.file.mimetype)) {
      const error = httpMsg.http400('Невалиден тип файл. Позволени са: JPEG, PNG, GIF, WebP', 'ERROR_INVALID_FILE_TYPE');
      return res.status(error.httpStatusCode).json(error.data);
    }

    // 3. Validate file size (double-check, multer limits already ran)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (req.file.size > maxSize) {
      const error = httpMsg.http400('Файлът е твърде голям. Максимален размер: 10MB', 'ERROR_FILE_SIZE_EXCEEDED');
      return res.status(error.httpStatusCode).json(error.data);
    }

    // 4. Upload to Cloudinary (pass mimetype for correct data URI)
    const result = await cloudinaryUploadService(req.file.buffer, req.file.originalname, req.file.mimetype);

    if (!result.success || !result.data) {
      const error = httpMsg.http400('Грешка при качване на изображението. Моля, опитайте отново.', 'ERROR_UPLOAD_FAILED');
      return res.status(error.httpStatusCode).json(error.data);
    }

    // 5. Return CDN URL and public ID
    return res.status(200).json(httpMsg.http200(result.data).data);

  } catch (error: any) {
    logger.error(`Upload controller error: ${error.message}`);
    next(error);
  }
};

export default {
  uploadImage,
};

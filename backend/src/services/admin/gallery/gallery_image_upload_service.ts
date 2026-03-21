import httpMsg from '@utils/http_messages/http_msg';
import galleryGetOneDAO from '@dao/gallery/gallery_get_one_dao';
import galleryUpdateDAO from '@dao/gallery/gallery_update_dao';
import cloudinaryGalleryUploadService from '@services/cloudinary/cloudinary_gallery_upload_service';
import { GALLERY_IMAGE_SELECT } from '@constants/gallery_constants';
import logger from '@utils/logger/winston/logger';
import prisma from '../../../../prisma/prisma-client';

const errCodeNotFound = 'ERROR_GALLERY_NOT_FOUND';
const errCode = 'ERROR_GALLERY_IMAGE_UPLOAD';
const msgNotFound = 'Галерията не е намерена';
const msgNoFile = 'Файлът е задължителен';
const msgError = 'Failed to upload gallery image';

export default async (galleryId: number, file: Express.Multer.File | undefined) => {
    if (!file) {
        return httpMsg.http400(msgNoFile, errCode);
    }

    const existing = await galleryGetOneDAO(galleryId, { id: true, coverImageUrl: true });
    if (!existing.success) {
        return httpMsg.http422(msgError, errCode);
    }
    if (!existing.data) {
        return httpMsg.http404(msgNotFound, errCodeNotFound);
    }

    const uploadResult = await cloudinaryGalleryUploadService(file.buffer, file.originalname, file.mimetype);
    if (!uploadResult.success || !uploadResult.data) {
        return httpMsg.http422(msgError, errCode);
    }

    const imageUrl = uploadResult.data.url;
    const thumbnailUrl = imageUrl.replace('/upload/', '/upload/w_150,h_150,c_fill/');

    // Use a transaction to atomically count + create, preventing duplicate displayOrder
    // when concurrent uploads hit the server simultaneously (AC2: max 3 concurrent).
    const createResult = await prisma
        .$transaction(async (tx) => {
            const count = await tx.galleryImage.count({ where: { galleryId } });
            const image = await tx.galleryImage.create({
                data: { galleryId, imageUrl, thumbnailUrl, displayOrder: count },
                select: GALLERY_IMAGE_SELECT as any,
            });
            return { success: true, data: image, error: null };
        })
        .catch((error: any) => {
            logger.error(`${msgError}: ${error}`);
            return { success: false, data: null, error: msgError };
        });
    if (!createResult.success) {
        return httpMsg.http422(msgError, errCode);
    }

    if (!existing.data.coverImageUrl) {
        await galleryUpdateDAO(galleryId, { coverImageUrl: imageUrl }, { id: true });
    }

    return httpMsg.http201(createResult.data);
};

import httpMsg from '@utils/http_messages/http_msg';
import galleryGetOneDAO from '@dao/gallery/gallery_get_one_dao';
import galleryUpdateDAO from '@dao/gallery/gallery_update_dao';
import galleryImageReorderDAO from '@dao/gallery/gallery_image_reorder_dao';
import { GALLERY_IMAGE_SELECT } from '@constants/gallery_constants';
import prisma from '../../../../prisma/prisma-client';

const errCodeNotFound = 'ERROR_GALLERY_NOT_FOUND';
const errCode = 'ERROR_GALLERY_IMAGE_REORDER';
const msgNotFound = 'Галерията не е намерена';
const msgError = 'Failed to reorder gallery images';

export default async (galleryId: number, images: { id: number; displayOrder: number }[]) => {
    const gallery = await galleryGetOneDAO(galleryId, { id: true });
    if (!gallery.success) {
        return httpMsg.http422(msgError, errCode);
    }
    if (!gallery.data) {
        return httpMsg.http404(msgNotFound, errCodeNotFound);
    }

    // Verify all image IDs belong to this gallery to prevent cross-gallery manipulation
    const ownedCount = await prisma.galleryImage.count({
        where: { id: { in: images.map((i) => i.id) }, galleryId },
    });
    if (ownedCount !== images.length) {
        return httpMsg.http400('Невалидни снимки за тази галерия', errCode);
    }

    const reorderResult = await galleryImageReorderDAO(images, GALLERY_IMAGE_SELECT);
    if (!reorderResult.success) {
        return httpMsg.http422(msgError, errCode);
    }

    const imageWithOrder0 = images.find((i) => i.displayOrder === 0);
    if (imageWithOrder0) {
        const coverImage = await prisma.galleryImage.findUnique({
            where: { id: imageWithOrder0.id },
            select: { imageUrl: true },
        });
        await galleryUpdateDAO(galleryId, { coverImageUrl: coverImage?.imageUrl ?? null }, { id: true });
    }

    const sorted = [...(reorderResult.data as any[])].sort((a, b) => a.displayOrder - b.displayOrder);
    return httpMsg.http200(sorted);
};

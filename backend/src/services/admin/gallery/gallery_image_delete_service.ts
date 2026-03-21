import httpMsg from '@utils/http_messages/http_msg';
import galleryGetOneDAO from '@dao/gallery/gallery_get_one_dao';
import galleryUpdateDAO from '@dao/gallery/gallery_update_dao';
import galleryImageDeleteDAO from '@dao/gallery/gallery_image_delete_dao';
import prisma from '../../../../prisma/prisma-client';

const errCodeNotFound = 'ERROR_GALLERY_NOT_FOUND';
const errCodeImageNotFound = 'ERROR_GALLERY_IMAGE_NOT_FOUND';
const errCode = 'ERROR_GALLERY_IMAGE_DELETE';
const msgNotFound = 'Галерията не е намерена';
const msgImageNotFound = 'Снимката не е намерена';
const msgError = 'Failed to delete gallery image';

export default async (galleryId: number, imageId: number) => {
    const gallery = await galleryGetOneDAO(galleryId, { id: true, coverImageUrl: true });
    if (!gallery.success) {
        return httpMsg.http422(msgError, errCode);
    }
    if (!gallery.data) {
        return httpMsg.http404(msgNotFound, errCodeNotFound);
    }

    const image = await prisma.galleryImage.findFirst({
        where: { id: imageId, galleryId },
        select: { id: true, imageUrl: true },
    });
    if (!image) {
        return httpMsg.http404(msgImageNotFound, errCodeImageNotFound);
    }

    const deleteResult = await galleryImageDeleteDAO(imageId);
    if (!deleteResult.success) {
        return httpMsg.http422(msgError, errCode);
    }

    if (gallery.data.coverImageUrl === image.imageUrl) {
        const nextImage = await prisma.galleryImage.findFirst({
            where: { galleryId, id: { not: imageId } },
            orderBy: { displayOrder: 'asc' },
            select: { imageUrl: true },
        });
        await galleryUpdateDAO(galleryId, { coverImageUrl: nextImage?.imageUrl ?? null }, { id: true });
    }

    return {
        httpStatusCode: 200,
        data: {
            success: true,
            message: 'Снимката е изтрита успешно',
            content: null,
        },
    };
};

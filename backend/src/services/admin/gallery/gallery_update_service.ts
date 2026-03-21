import httpMsg from '@utils/http_messages/http_msg';
import galleryUpdateDAO from '@dao/gallery/gallery_update_dao';
import galleryGetOneDAO from '@dao/gallery/gallery_get_one_dao';
import { UpdateGalleryType } from '@schemas/gallery_schema';
import { GALLERY_DETAIL_SELECT } from '@constants/gallery_constants';

const errCodeNotFound = 'ERROR_GALLERY_NOT_FOUND';
const errCode = 'ERROR_GALLERY_UPDATE';
const msgNotFound = 'Галерията не е намерена';
const msgError = 'Failed to update gallery';

type UpdateGalleryBody = UpdateGalleryType['body'];

export default async (id: number, galleryData: UpdateGalleryBody) => {
    // Separate existence check to distinguish 404 from DB errors (Story 6.2 M2 fix)
    // Also fetch current status to avoid overwriting publishedAt on redundant status update
    const existing = await galleryGetOneDAO(id, { id: true, status: true });
    if (!existing.success) {
        return httpMsg.http422(msgError, errCode);
    }
    if (!existing.data) {
        return httpMsg.http404(msgNotFound, errCodeNotFound);
    }

    const updateData: any = { ...galleryData };
    if (galleryData.status === 'PUBLISHED' && existing.data.status !== 'PUBLISHED') {
        updateData.publishedAt = new Date();
    } else if (galleryData.status === 'DRAFT' && existing.data.status !== 'DRAFT') {
        updateData.publishedAt = null;
    }

    const result = await galleryUpdateDAO(id, updateData, GALLERY_DETAIL_SELECT);

    if (!result.success || !result.data) {
        return httpMsg.http422(msgError, errCode);
    }

    return httpMsg.http200(result.data);
};

import httpMsg from '@utils/http_messages/http_msg';
import galleryCreateDAO from '@dao/gallery/gallery_create_dao';
import { CreateGalleryType } from '@schemas/gallery_schema';
import { GALLERY_DETAIL_SELECT } from '@constants/gallery_constants';

const errCode = 'ERROR_GALLERY_CREATE';
const msgError = 'Failed to create gallery';

type CreateGalleryBody = CreateGalleryType['body'];

export default async (galleryData: CreateGalleryBody) => {
    const resolvedStatus = galleryData.status ?? 'DRAFT';
    const dataWithDefaults = {
        ...galleryData,
        status: resolvedStatus,
        publishedAt: resolvedStatus === 'PUBLISHED' ? new Date() : null,
    };

    const result = await galleryCreateDAO(dataWithDefaults, GALLERY_DETAIL_SELECT);

    if (!result.success || !result.data) {
        return httpMsg.http422(msgError, errCode);
    }

    return httpMsg.http201(result.data);
};

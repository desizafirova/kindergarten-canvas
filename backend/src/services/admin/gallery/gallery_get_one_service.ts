import httpMsg from '@utils/http_messages/http_msg';
import galleryGetOneDAO from '@dao/gallery/gallery_get_one_dao';
import { GALLERY_DETAIL_SELECT } from '@constants/gallery_constants';

const errCodeNotFound = 'ERROR_GALLERY_NOT_FOUND';
const msgNotFound = 'Галерията не е намерена';
const errCode = 'ERROR_GALLERY_GET_ONE';
const msgError = 'Failed to get gallery';

export default async (id: number) => {
    const result = await galleryGetOneDAO(id, GALLERY_DETAIL_SELECT);

    if (!result.success) {
        return httpMsg.http422(msgError, errCode);
    }
    if (!result.data) {
        return httpMsg.http404(msgNotFound, errCodeNotFound);
    }

    return httpMsg.http200(result.data);
};

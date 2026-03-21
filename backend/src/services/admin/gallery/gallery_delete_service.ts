import httpMsg from '@utils/http_messages/http_msg';
import galleryDeleteDAO from '@dao/gallery/gallery_delete_dao';
import galleryGetOneDAO from '@dao/gallery/gallery_get_one_dao';

const errCodeNotFound = 'ERROR_GALLERY_NOT_FOUND';
const errCodeDelete = 'ERROR_GALLERY_DELETE';
const msgNotFound = 'Галерията не е намерена';
const msgError = 'Failed to delete gallery';

export default async (id: number) => {
    // Separate existence check (Story 6.2 M2 fix: avoid masking DB errors as 404)
    const existing = await galleryGetOneDAO(id, { id: true });
    if (!existing.success) {
        return httpMsg.http422(msgError, errCodeDelete);
    }
    if (!existing.data) {
        return httpMsg.http404(msgNotFound, errCodeNotFound);
    }

    const result = await galleryDeleteDAO(id);
    if (!result.success) {
        return httpMsg.http422(msgError, errCodeDelete);
    }

    return {
        httpStatusCode: 200,
        data: {
            success: true,
            message: 'Галерията е изтрита успешно',
            content: null,
        },
    };
};

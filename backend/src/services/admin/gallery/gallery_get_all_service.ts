import httpMsg from '@utils/http_messages/http_msg';
import galleryGetAllDAO from '@dao/gallery/gallery_get_all_dao';
import { GALLERY_LIST_SELECT } from '@constants/gallery_constants';

const errCode = 'ERROR_GALLERY_GET_ALL';
const msgError = 'Failed to get all galleries';

export default async (statusFilter?: string) => {
    const where: any = {};
    if (statusFilter) where.status = statusFilter;

    const orderBy = [{ createdAt: 'desc' as const }];

    const result = await galleryGetAllDAO(where, GALLERY_LIST_SELECT, orderBy);

    if (!result.success || !result.data) {
        return httpMsg.http422(msgError, errCode);
    }

    // Transform _count.images → imageCount, remove _count from response
    const galleries = result.data.map((g: any) => {
        const { _count, ...rest } = g;
        return { ...rest, imageCount: _count?.images ?? 0 };
    });

    return httpMsg.http200(galleries);
};

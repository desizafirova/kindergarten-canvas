import httpMsg from '@utils/http_messages/http_msg';
import newsGetAllDAO from '@dao/news/news_get_all_dao';

const errCode = 'ERROR_NEWS_GET_ALL';
const msgError = 'Failed to get all news';

export default async (statusFilter?: string) => {
    const where = statusFilter ? { status: statusFilter as any } : {};

    const select = {
        id: true,
        title: true,
        content: true,
        imageUrl: true,
        status: true,
        publishedAt: true,
        createdAt: true,
        updatedAt: true,
    };

    const orderBy = { createdAt: 'desc' as const };

    const news = await getAllNews(where, select, orderBy);

    if (!news.success || !news.data) {
        return httpMsg.http422(msgError, errCode);
    }

    return httpMsg.http200(news.data);
};

const getAllNews = async (where: object, select: object, orderBy: object) => {
    const result = await newsGetAllDAO(where, select, orderBy);

    return { success: result.success, data: result.data, error: result.error };
};

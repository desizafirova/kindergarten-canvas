import httpMsg from '@utils/http_messages/http_msg';
import newsGetOneDAO from '@dao/news/news_get_one_dao';

const errCode = 'ERROR_NEWS_NOT_FOUND';
const msgError = 'Новината не е намерена';

export default async (id: number) => {
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

    const newsItem = await getOneNews(id, select);

    if (!newsItem.success || !newsItem.data) {
        return httpMsg.http404(msgError, errCode);
    }

    return httpMsg.http200(newsItem.data);
};

const getOneNews = async (id: number, select: object) => {
    const result = await newsGetOneDAO(id, select);

    return { success: result.success, data: result.data, error: result.error };
};

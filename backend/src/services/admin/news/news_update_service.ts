import httpMsg from '@utils/http_messages/http_msg';
import newsUpdateDAO from '@dao/news/news_update_dao';
import { UpdateNewsType } from '@schemas/news_schema';

const errCode = 'ERROR_NEWS_UPDATE';
const msgError = 'Failed to update news item';

type UpdateNewsBody = UpdateNewsType['body'];

export default async (id: number, newsData: UpdateNewsBody) => {
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

    const newsItem = await updateNews(id, newsData, select);

    if (!newsItem.success || !newsItem.data) {
        return httpMsg.http422(msgError, errCode);
    }

    return httpMsg.http200(newsItem.data);
};

const updateNews = async (id: number, data: UpdateNewsBody, select: object) => {
    const result = await newsUpdateDAO(id, data, select);

    return { success: result.success, data: result.data, error: result.error };
};

import httpMsg from '@utils/http_messages/http_msg';
import newsCreateDAO from '@dao/news/news_create_dao';
import { CreateNewsType } from '@schemas/news_schema';

const errCode = 'ERROR_NEWS_CREATE';
const msgError = 'Failed to create news item';

type CreateNewsBody = CreateNewsType['body'];

export default async (newsData: CreateNewsBody) => {
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

    // Ensure status defaults to DRAFT if not provided
    const dataWithDefaults = {
        ...newsData,
        status: newsData.status || 'DRAFT',
    };

    const newsItem = await createNews(dataWithDefaults, select);

    if (!newsItem.success || !newsItem.data) {
        return httpMsg.http422(msgError, errCode);
    }

    return httpMsg.http201(newsItem.data);
};

const createNews = async (data: CreateNewsBody & { status: string }, select: object) => {
    const result = await newsCreateDAO(data, select);

    return { success: result.success, data: result.data, error: result.error };
};

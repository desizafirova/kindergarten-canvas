import httpMsg from '@utils/http_messages/http_msg';
import newsUpdateDAO from '@dao/news/news_update_dao';
import newsGetOneDAO from '@dao/news/news_get_one_dao';
import { UpdateNewsType } from '@schemas/news_schema';
import { notifyNewsPublished } from '@services/email';
import logger from '@utils/logger/winston/logger';

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

    let isFirstPublish = false;
    if (newsData.status === 'PUBLISHED') {
        const existing = await newsGetOneDAO(id, { id: true, publishedAt: true });
        isFirstPublish = !(existing.data as any)?.publishedAt;
    }

    const newsItem = await updateNews(id, newsData, select);

    if (!newsItem.success || !newsItem.data) {
        return httpMsg.http422(msgError, errCode);
    }

    if (isFirstPublish && newsItem.data) {
        const item = newsItem.data as any;
        notifyNewsPublished({ id: item.id, title: item.title, content: item.content }).catch(
            (err: unknown) =>
                logger.error('News publish notification error', {
                    error: err instanceof Error ? err.message : String(err),
                }),
        );
    }

    return httpMsg.http200(newsItem.data);
};

const updateNews = async (id: number, data: UpdateNewsBody, select: object) => {
    const result = await newsUpdateDAO(id, data, select);

    return { success: result.success, data: result.data, error: result.error };
};

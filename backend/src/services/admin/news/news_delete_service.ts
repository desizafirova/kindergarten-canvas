import httpMsg from '@utils/http_messages/http_msg';
import newsDeleteDAO from '@dao/news/news_delete_dao';
import newsGetOneDAO from '@dao/news/news_get_one_dao';

const errCodeNotFound = 'ERROR_NEWS_NOT_FOUND';
const errCodeDelete = 'ERROR_NEWS_DELETE';
const msgNotFound = 'Новината не е намерена';
const msgError = 'Failed to delete news item';
const successMsg = 'Новината е изтрита успешно';

export default async (id: number) => {
    // First check if news item exists (return 404 if not found)
    const existingItem = await newsGetOneDAO(id, { id: true });
    if (!existingItem.success || !existingItem.data) {
        return httpMsg.http404(msgNotFound, errCodeNotFound);
    }

    const result = await deleteNews(id);

    if (!result.success) {
        return httpMsg.http422(msgError, errCodeDelete);
    }

    // Return custom Bulgarian success message
    return {
        httpStatusCode: 200,
        data: {
            success: true,
            message: successMsg,
            content: null,
        },
    };
};

const deleteNews = async (id: number) => {
    const result = await newsDeleteDAO(id);

    return { success: result.success, data: result.data, error: result.error };
};

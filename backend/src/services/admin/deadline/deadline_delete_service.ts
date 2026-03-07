import httpMsg from '@utils/http_messages/http_msg';
import deadlineGetOneDAO from '@dao/deadline/deadline_get_one_dao';
import deadlineDeleteDAO from '@dao/deadline/deadline_delete_dao';

const errCodeNotFound = 'ERROR_DEADLINE_NOT_FOUND';
const errCodeDelete = 'ERROR_DEADLINE_DELETE';
const msgError = 'Failed to delete deadline';
const msgNotFound = 'Срокът не е намерен';

export default async (id: number) => {
    // Check existence first (AC7: return 404 if not found)
    const existing = await deadlineGetOneDAO(id, { id: true });

    if (!existing.success) {
        return httpMsg.http422(msgError, errCodeDelete);
    }

    if (!existing.data) {
        return httpMsg.http404(msgNotFound, errCodeNotFound);
    }

    const result = await deadlineDeleteDAO(id);

    if (!result.success) {
        return httpMsg.http422(msgError, errCodeDelete);
    }

    return {
        httpStatusCode: 200,
        data: {
            success: true,
            message: 'Срокът е изтрит успешно',
            content: null,
        },
    };
};

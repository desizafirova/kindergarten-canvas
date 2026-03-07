import httpMsg from '@utils/http_messages/http_msg';
import eventDeleteDAO from '@dao/event/event_delete_dao';
import eventGetOneDAO from '@dao/event/event_get_one_dao';

const errCodeNotFound = 'ERROR_EVENT_NOT_FOUND';
const errCodeDelete = 'ERROR_EVENT_DELETE';
const msgNotFound = 'Събитието не е намерено';
const msgError = 'Failed to delete event';

export default async (id: number) => {
    // First check if event exists (return 404 if not found)
    const existing = await eventGetOneDAO(id, { id: true });
    if (!existing.success || !existing.data) {
        return httpMsg.http404(msgNotFound, errCodeNotFound);
    }

    const result = await eventDeleteDAO(id);

    if (!result.success) {
        return httpMsg.http422(msgError, errCodeDelete);
    }

    // Return custom Bulgarian success message (AC requirement)
    return {
        httpStatusCode: 200,
        data: {
            success: true,
            message: 'Събитието е изтрито успешно',
            content: null,
        },
    };
};

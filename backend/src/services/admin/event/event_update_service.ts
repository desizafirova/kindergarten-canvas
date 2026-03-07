import httpMsg from '@utils/http_messages/http_msg';
import eventUpdateDAO from '@dao/event/event_update_dao';
import eventGetOneDAO from '@dao/event/event_get_one_dao';
import { UpdateEventType } from '@schemas/event_schema';
import { EVENT_SELECT } from '@constants/event_constants';

const errCodeNotFound = 'ERROR_EVENT_NOT_FOUND';
const errCode = 'ERROR_EVENT_UPDATE';
const msgNotFound = 'Събитието не е намерено';
const msgError = 'Failed to update event';

type UpdateEventBody = UpdateEventType['body'];

export default async (id: number, eventData: UpdateEventBody) => {
    // First check if event exists (return 404 if not found)
    const existing = await eventGetOneDAO(id, { id: true });
    if (!existing.success || !existing.data) {
        return httpMsg.http404(msgNotFound, errCodeNotFound);
    }

    const updateData: any = { ...eventData };
    if (eventData.status === 'PUBLISHED') updateData.publishedAt = new Date();
    else if (eventData.status === 'DRAFT') updateData.publishedAt = null;

    const result = await eventUpdateDAO(id, updateData, EVENT_SELECT);

    if (!result.success || !result.data) {
        return httpMsg.http422(msgError, errCode);
    }

    return httpMsg.http200(result.data);
};

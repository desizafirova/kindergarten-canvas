import httpMsg from '@utils/http_messages/http_msg';
import eventUpdateDAO from '@dao/event/event_update_dao';
import eventGetOneDAO from '@dao/event/event_get_one_dao';
import { UpdateEventType } from '@schemas/event_schema';
import { EVENT_SELECT } from '@constants/event_constants';
import { notifyEventPublished } from '@services/email';
import logger from '@utils/logger/winston/logger';

const errCodeNotFound = 'ERROR_EVENT_NOT_FOUND';
const errCode = 'ERROR_EVENT_UPDATE';
const msgNotFound = 'Събитието не е намерено';
const msgError = 'Failed to update event';

type UpdateEventBody = UpdateEventType['body'];

export default async (id: number, eventData: UpdateEventBody) => {
    // First check if event exists (return 404 if not found) — also fetch publishedAt for first-publish detection
    const existing = await eventGetOneDAO(id, { id: true, publishedAt: true });
    if (!existing.success || !existing.data) {
        return httpMsg.http404(msgNotFound, errCodeNotFound);
    }

    const isFirstPublish =
        eventData.status === 'PUBLISHED' &&
        !(existing.data as any)?.publishedAt;

    const updateData: any = { ...eventData };
    if (eventData.status === 'PUBLISHED' && !(existing.data as any)?.publishedAt) {
        updateData.publishedAt = new Date();
    } else if (eventData.status === 'DRAFT') {
        updateData.publishedAt = null;
    }

    const result = await eventUpdateDAO(id, updateData, EVENT_SELECT);

    if (!result.success || !result.data) {
        return httpMsg.http422(msgError, errCode);
    }

    if (isFirstPublish) {
        const item = result.data as any;
        notifyEventPublished({
            id: item.id,
            title: item.title,
            eventDate: item.eventDate,
            location: item.location,
            description: item.description,
        }).catch((err: unknown) =>
            logger.error('Event publish notification error', {
                error: err instanceof Error ? err.message : String(err),
            }),
        );
    }

    return httpMsg.http200(result.data);
};

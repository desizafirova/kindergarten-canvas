import httpMsg from '@utils/http_messages/http_msg';
import eventCreateDAO from '@dao/event/event_create_dao';
import { CreateEventType } from '@schemas/event_schema';
import { EVENT_SELECT } from '@constants/event_constants';

const errCode = 'ERROR_EVENT_CREATE';
const msgError = 'Failed to create event';

type CreateEventBody = CreateEventType['body'];

export default async (eventData: CreateEventBody) => {
    // Ensure defaults: status=DRAFT, isImportant=false (AC requirement)
    const resolvedStatus = eventData.status || 'DRAFT';
    const dataWithDefaults = {
        ...eventData,
        status: resolvedStatus,
        isImportant: eventData.isImportant ?? false,
        publishedAt: resolvedStatus === 'PUBLISHED' ? new Date() : null,
    };

    const result = await eventCreateDAO(dataWithDefaults, EVENT_SELECT);

    if (!result.success || !result.data) {
        return httpMsg.http422(msgError, errCode);
    }

    return httpMsg.http201(result.data);
};

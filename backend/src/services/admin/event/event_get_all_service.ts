import httpMsg from '@utils/http_messages/http_msg';
import eventGetAllDAO from '@dao/event/event_get_all_dao';
import { EVENT_SELECT } from '@constants/event_constants';

const errCode = 'ERROR_EVENT_GET_ALL';
const msgError = 'Failed to get all events';

export default async (statusFilter?: string, upcoming?: string) => {
    const where: any = {};
    if (statusFilter) where.status = statusFilter;
    if (upcoming === 'true') where.eventDate = { gte: new Date() };

    // CRITICAL: Sort by eventDate ASC (upcoming first) per AC requirement
    const orderBy = [{ eventDate: 'asc' as const }];

    const result = await eventGetAllDAO(where, EVENT_SELECT, orderBy);

    if (!result.success || !result.data) {
        return httpMsg.http422(msgError, errCode);
    }

    return httpMsg.http200(result.data);
};

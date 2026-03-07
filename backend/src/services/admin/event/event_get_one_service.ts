import httpMsg from '@utils/http_messages/http_msg';
import eventGetOneDAO from '@dao/event/event_get_one_dao';
import { EVENT_SELECT } from '@constants/event_constants';

const errCode = 'ERROR_EVENT_NOT_FOUND';
const msgError = 'Събитието не е намерено';

export default async (id: number) => {
    const result = await eventGetOneDAO(id, EVENT_SELECT);

    if (!result.success || !result.data) {
        return httpMsg.http404(msgError, errCode);
    }

    return httpMsg.http200(result.data);
};

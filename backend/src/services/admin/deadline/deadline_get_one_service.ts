import httpMsg from '@utils/http_messages/http_msg';
import deadlineGetOneDAO from '@dao/deadline/deadline_get_one_dao';
import { DEADLINE_SELECT } from '@constants/deadline_constants';

const errCode = 'ERROR_DEADLINE_GET_ONE';
const msgError = 'Failed to get deadline';
const msgNotFound = 'Срокът не е намерен';

export default async (id: number) => {
    const result = await deadlineGetOneDAO(id, DEADLINE_SELECT);

    if (!result.success) {
        return httpMsg.http422(msgError, errCode);
    }

    if (!result.data) {
        return httpMsg.http404(msgNotFound, errCode);
    }

    return httpMsg.http200(result.data);
};

import httpMsg from '@utils/http_messages/http_msg';
import jobGetOneDAO from '@dao/job/job_get_one_dao';
import { JOB_SELECT } from '@constants/job_constants';

const errCodeNotFound = 'ERROR_JOB_NOT_FOUND';
const msgNotFound = 'Позицията не е намерена';
const errCode = 'ERROR_JOB_GET_ONE';
const msgError = 'Failed to get job';

export default async (id: number) => {
    const result = await jobGetOneDAO(id, JOB_SELECT);

    if (!result.success) {
        return httpMsg.http422(msgError, errCode);
    }
    if (!result.data) {
        return httpMsg.http404(msgNotFound, errCodeNotFound);
    }

    return httpMsg.http200(result.data);
};

import httpMsg from '@utils/http_messages/http_msg';
import jobDeleteDAO from '@dao/job/job_delete_dao';
import jobGetOneDAO from '@dao/job/job_get_one_dao';

const errCodeNotFound = 'ERROR_JOB_NOT_FOUND';
const errCodeDelete = 'ERROR_JOB_DELETE';
const msgNotFound = 'Позицията не е намерена';
const msgError = 'Failed to delete job';

export default async (id: number) => {
    const existing = await jobGetOneDAO(id, { id: true });
    if (!existing.success) {
        return httpMsg.http422(msgError, errCodeDelete);
    }
    if (!existing.data) {
        return httpMsg.http404(msgNotFound, errCodeNotFound);
    }

    const result = await jobDeleteDAO(id);
    if (!result.success) {
        return httpMsg.http422(msgError, errCodeDelete);
    }

    return {
        httpStatusCode: 200,
        data: {
            success: true,
            message: 'Позицията е изтрита успешно',
            content: null,
        },
    };
};

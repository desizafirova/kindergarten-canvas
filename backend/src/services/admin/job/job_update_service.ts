import httpMsg from '@utils/http_messages/http_msg';
import jobUpdateDAO from '@dao/job/job_update_dao';
import jobGetOneDAO from '@dao/job/job_get_one_dao';
import { UpdateJobType } from '@schemas/job_schema';
import { JOB_SELECT } from '@constants/job_constants';

const errCodeNotFound = 'ERROR_JOB_NOT_FOUND';
const errCode = 'ERROR_JOB_UPDATE';
const msgNotFound = 'Позицията не е намерена';
const msgError = 'Failed to update job';

type UpdateJobBody = UpdateJobType['body'];

export default async (id: number, jobData: UpdateJobBody) => {
    const existing = await jobGetOneDAO(id, { id: true });
    if (!existing.success) {
        return httpMsg.http422(msgError, errCode);
    }
    if (!existing.data) {
        return httpMsg.http404(msgNotFound, errCodeNotFound);
    }

    const updateData: any = { ...jobData };
    if (jobData.status === 'PUBLISHED') updateData.publishedAt = new Date();
    else if (jobData.status === 'DRAFT') updateData.publishedAt = null;

    const result = await jobUpdateDAO(id, updateData, JOB_SELECT);

    if (!result.success || !result.data) {
        return httpMsg.http422(msgError, errCode);
    }

    return httpMsg.http200(result.data);
};

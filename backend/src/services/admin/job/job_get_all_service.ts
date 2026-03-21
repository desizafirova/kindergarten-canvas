import httpMsg from '@utils/http_messages/http_msg';
import jobGetAllDAO from '@dao/job/job_get_all_dao';
import { JOB_SELECT } from '@constants/job_constants';

const errCode = 'ERROR_JOB_GET_ALL';
const msgError = 'Failed to get all jobs';

export default async (statusFilter?: string, isActiveFilter?: string) => {
    const where: any = {};
    if (statusFilter) where.status = statusFilter;
    if (isActiveFilter === 'true') where.isActive = true;
    if (isActiveFilter === 'false') where.isActive = false;

    const orderBy = [{ createdAt: 'desc' as const }];

    const result = await jobGetAllDAO(where, JOB_SELECT, orderBy);

    if (!result.success || !result.data) {
        return httpMsg.http422(msgError, errCode);
    }

    return httpMsg.http200(result.data);
};

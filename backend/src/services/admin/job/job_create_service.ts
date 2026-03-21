import httpMsg from '@utils/http_messages/http_msg';
import jobCreateDAO from '@dao/job/job_create_dao';
import { CreateJobType } from '@schemas/job_schema';
import { JOB_SELECT } from '@constants/job_constants';

const errCode = 'ERROR_JOB_CREATE';
const msgError = 'Failed to create job';

type CreateJobBody = CreateJobType['body'];

export default async (jobData: CreateJobBody) => {
    const resolvedStatus = jobData.status ?? 'DRAFT';
    const dataWithDefaults = {
        ...jobData,
        status: resolvedStatus,
        isActive: jobData.isActive ?? true,
        publishedAt: resolvedStatus === 'PUBLISHED' ? new Date() : null,
    };

    const result = await jobCreateDAO(dataWithDefaults, JOB_SELECT);

    if (!result.success || !result.data) {
        return httpMsg.http422(msgError, errCode);
    }

    return httpMsg.http201(result.data);
};

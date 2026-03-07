import httpMsg from '@utils/http_messages/http_msg';
import deadlineCreateDAO from '@dao/deadline/deadline_create_dao';
import { CreateDeadlineType } from '@schemas/deadline_schema';
import { DEADLINE_SELECT } from '@constants/deadline_constants';

const errCode = 'ERROR_DEADLINE_CREATE';
const msgError = 'Failed to create deadline';

type CreateDeadlineBody = CreateDeadlineType['body'];

export default async (deadlineData: CreateDeadlineBody) => {
    const resolvedStatus = deadlineData.status || 'DRAFT';
    const dataWithDefaults = {
        ...deadlineData,
        status: resolvedStatus,
        isUrgent: deadlineData.isUrgent ?? false,
        // CRITICAL: Set publishedAt when creating with PUBLISHED status (AC5 + test assertion)
        publishedAt: resolvedStatus === 'PUBLISHED' ? new Date() : null,
    };

    const result = await deadlineCreateDAO(dataWithDefaults, DEADLINE_SELECT);

    if (!result.success || !result.data) {
        return httpMsg.http422(msgError, errCode);
    }

    return httpMsg.http201(result.data);
};

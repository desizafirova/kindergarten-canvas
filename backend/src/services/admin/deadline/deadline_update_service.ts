import httpMsg from '@utils/http_messages/http_msg';
import deadlineGetOneDAO from '@dao/deadline/deadline_get_one_dao';
import deadlineUpdateDAO from '@dao/deadline/deadline_update_dao';
import { UpdateDeadlineType } from '@schemas/deadline_schema';
import { DEADLINE_SELECT } from '@constants/deadline_constants';

const errCode = 'ERROR_DEADLINE_UPDATE';
const msgError = 'Failed to update deadline';
const msgNotFound = 'Срокът не е намерен';

type UpdateDeadlineBody = UpdateDeadlineType['body'];

export default async (id: number, deadlineData: UpdateDeadlineBody) => {
    // Check existence first
    const existing = await deadlineGetOneDAO(id, { id: true, publishedAt: true, status: true });

    if (!existing.success) {
        return httpMsg.http422(msgError, errCode);
    }

    if (!existing.data) {
        return httpMsg.http404(msgNotFound, errCode);
    }

    // Handle publishedAt on status transitions
    let publishedAt: Date | null | undefined = undefined;
    if (deadlineData.status === 'PUBLISHED' && !existing.data.publishedAt) {
        publishedAt = new Date();
    } else if (deadlineData.status === 'DRAFT') {
        publishedAt = null;
    }

    const updatePayload: any = { ...deadlineData };
    if (publishedAt !== undefined) updatePayload.publishedAt = publishedAt;

    const result = await deadlineUpdateDAO(id, updatePayload, DEADLINE_SELECT);

    if (!result.success || !result.data) {
        return httpMsg.http422(msgError, errCode);
    }

    return httpMsg.http200(result.data);
};

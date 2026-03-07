import httpMsg from '@utils/http_messages/http_msg';
import deadlineGetAllDAO from '@dao/deadline/deadline_get_all_dao';
import { DEADLINE_SELECT } from '@constants/deadline_constants';

const errCode = 'ERROR_DEADLINE_GET_ALL';
const msgError = 'Failed to get all deadlines';

export default async (statusFilter?: string, upcoming?: string) => {
    const where: any = {};
    if (statusFilter) where.status = statusFilter;
    if (upcoming === 'true') where.deadlineDate = { gte: new Date() };

    // CRITICAL: Sort by deadlineDate ASC (nearest first) per AC1
    const orderBy = [{ deadlineDate: 'asc' as const }];

    const result = await deadlineGetAllDAO(where, DEADLINE_SELECT, orderBy);

    if (!result.success || !result.data) {
        return httpMsg.http422(msgError, errCode);
    }

    return httpMsg.http200(result.data);
};

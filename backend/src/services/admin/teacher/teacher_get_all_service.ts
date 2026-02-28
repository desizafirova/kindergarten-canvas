import httpMsg from '@utils/http_messages/http_msg';
import teacherGetAllDAO from '@dao/teacher/teacher_get_all_dao';
import { TEACHER_SELECT } from '@constants/teacher_constants';

const errCode = 'ERROR_TEACHER_GET_ALL';
const msgError = 'Failed to get all teachers';

export default async (statusFilter?: string) => {
    const where = statusFilter ? { status: statusFilter as any } : {};

    // CRITICAL: Sort by displayOrder ASC, then lastName ASC (AC requirement)
    const orderBy = [
        { displayOrder: 'asc' as const },
        { lastName: 'asc' as const },
    ];

    const teachers = await getAllTeachers(where, TEACHER_SELECT, orderBy);

    if (!teachers.success || !teachers.data) {
        return httpMsg.http422(msgError, errCode);
    }

    return httpMsg.http200(teachers.data);
};

const getAllTeachers = async (where: object, select: object, orderBy: object) => {
    const result = await teacherGetAllDAO(where, select, orderBy);

    return { success: result.success, data: result.data, error: result.error };
};

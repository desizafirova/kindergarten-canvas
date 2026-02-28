import httpMsg from '@utils/http_messages/http_msg';
import teacherCreateDAO from '@dao/teacher/teacher_create_dao';
import { CreateTeacherType } from '@schemas/teacher_schema';
import { TEACHER_SELECT } from '@constants/teacher_constants';

const errCode = 'ERROR_TEACHER_CREATE';
const msgError = 'Failed to create teacher';

type CreateTeacherBody = CreateTeacherType['body'];

export default async (teacherData: CreateTeacherBody) => {
    // Ensure status defaults to DRAFT if not provided (AC requirement)
    const dataWithDefaults = {
        ...teacherData,
        status: teacherData.status || 'DRAFT',
    };

    const teacher = await createTeacher(dataWithDefaults, TEACHER_SELECT);

    if (!teacher.success || !teacher.data) {
        return httpMsg.http422(msgError, errCode);
    }

    return httpMsg.http201(teacher.data);
};

const createTeacher = async (data: CreateTeacherBody & { status: string }, select: object) => {
    const result = await teacherCreateDAO(data, select);

    return { success: result.success, data: result.data, error: result.error };
};

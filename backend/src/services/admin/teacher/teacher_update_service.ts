import httpMsg from '@utils/http_messages/http_msg';
import teacherUpdateDAO from '@dao/teacher/teacher_update_dao';
import teacherGetOneDAO from '@dao/teacher/teacher_get_one_dao';
import { UpdateTeacherType } from '@schemas/teacher_schema';
import { TEACHER_SELECT } from '@constants/teacher_constants';

const errCodeNotFound = 'ERROR_TEACHER_NOT_FOUND';
const errCode = 'ERROR_TEACHER_UPDATE';
const msgNotFound = 'Учителят не е намерен';
const msgError = 'Failed to update teacher';

type UpdateTeacherBody = UpdateTeacherType['body'];

export default async (id: number, teacherData: UpdateTeacherBody) => {
    // First check if teacher exists (return 404 if not found)
    const existingTeacher = await teacherGetOneDAO(id, { id: true });
    if (!existingTeacher.success || !existingTeacher.data) {
        return httpMsg.http404(msgNotFound, errCodeNotFound);
    }

    const teacher = await updateTeacher(id, teacherData, TEACHER_SELECT);

    if (!teacher.success || !teacher.data) {
        return httpMsg.http422(msgError, errCode);
    }

    return httpMsg.http200(teacher.data);
};

const updateTeacher = async (id: number, data: UpdateTeacherBody, select: object) => {
    const result = await teacherUpdateDAO(id, data, select);

    return { success: result.success, data: result.data, error: result.error };
};

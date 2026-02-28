import httpMsg from '@utils/http_messages/http_msg';
import teacherGetOneDAO from '@dao/teacher/teacher_get_one_dao';
import { TEACHER_SELECT } from '@constants/teacher_constants';

const errCode = 'ERROR_TEACHER_NOT_FOUND';
const msgError = 'Учителят не е намерен';

export default async (id: number) => {
    const teacher = await getOneTeacher(id, TEACHER_SELECT);

    if (!teacher.success || !teacher.data) {
        return httpMsg.http404(msgError, errCode);
    }

    return httpMsg.http200(teacher.data);
};

const getOneTeacher = async (id: number, select: object) => {
    const result = await teacherGetOneDAO(id, select);

    return { success: result.success, data: result.data, error: result.error };
};

import httpMsg from '@utils/http_messages/http_msg';
import teacherDeleteDAO from '@dao/teacher/teacher_delete_dao';
import teacherGetOneDAO from '@dao/teacher/teacher_get_one_dao';

const errCodeNotFound = 'ERROR_TEACHER_NOT_FOUND';
const errCodeDelete = 'ERROR_TEACHER_DELETE';
const msgNotFound = 'Учителят не е намерен';
const msgError = 'Failed to delete teacher';
const successMsg = 'Учителят е изтрит успешно';

export default async (id: number) => {
    // First check if teacher exists (return 404 if not found)
    const existingTeacher = await teacherGetOneDAO(id, { id: true });
    if (!existingTeacher.success || !existingTeacher.data) {
        return httpMsg.http404(msgNotFound, errCodeNotFound);
    }

    const result = await deleteTeacher(id);

    if (!result.success) {
        return httpMsg.http422(msgError, errCodeDelete);
    }

    // Return custom Bulgarian success message (AC requirement)
    return {
        httpStatusCode: 200,
        data: {
            success: true,
            message: successMsg,
            content: null,
        },
    };
};

const deleteTeacher = async (id: number) => {
    const result = await teacherDeleteDAO(id);

    return { success: result.success, data: result.data, error: result.error };
};

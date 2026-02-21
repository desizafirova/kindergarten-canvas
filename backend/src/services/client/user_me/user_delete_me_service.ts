import httpMsg from '@utils/http_messages/http_msg';
import servFindOneUser from '@dao/users/user_get_one_dao';
import prisma from '../../../../prisma/prisma-client';
import logger from '@utils/logger/winston/logger';

const errorCod = 'ERROR_USER_DELETE_ME';
const errorMsg = 'Failed to delete user';

export default async (id: number) => {
    // Check required user data
    if (!checkRequiredDatas(id)) return httpMsg.http422(errorMsg, errorCod);

    // Check existing user
    const user = await getUser({ id });
    if (!user.success) return httpMsg.http422(user.error || '', errorCod);

    // Actually delete the user (no soft delete in simplified schema)
    const deleted = await deleteUser(user.data.id);
    if (!deleted.success) return httpMsg.http422(errorMsg, errorCod);

    return httpMsg.http204(null);
};

const checkRequiredDatas = (id: number) => /* istanbul ignore next */ {
    if (!id) return false;
    return true;
};

const getUser = async (where: object) => {
    // Select only fields that exist in the simplified User schema
    const select = {
        id: true,
        email: true,
        role: true,
    };

    const result = await servFindOneUser(where, select);
    if (!result.success || !result.data) return { success: false, data: null, error: errorMsg };

    return { success: true, data: result.data, error: null };
};

const deleteUser = async (id: number) => {
    try {
        await prisma.user.delete({
            where: { id },
        });
        return { success: true };
    } catch (error: any) {
        /* istanbul ignore next */
        logger.error(`${errorMsg} ${error}`);
        return { success: false };
    }
};

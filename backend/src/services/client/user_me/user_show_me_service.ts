import httpMsg from '@utils/http_messages/http_msg';
import servFindOneUser from '@dao/users/user_get_one_dao';

const errorCod = 'ERROR_USER_FIND_ME';
const errorMsg = 'Failed to show user';

export default async (id: number) => {
    // Check required user data
    if (!checkRequiredDatas(id)) return httpMsg.http422(errorMsg, errorCod);

    // Get user by id
    const user = await getUser({ id });
    if (!user.success) return httpMsg.http422(user.error || '', errorCod);

    return httpMsg.http200(user.data);
};

const checkRequiredDatas = (id: number) => /* istanbul ignore next */ {
    if (!id) return false;
    return true;
};

const getUser = async (where: object) => {
    // Select only fields that exist in the simplified User schema
    // Do NOT include password in response
    const select = {
        id: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
    };

    const result = await servFindOneUser(where, select);
    if (!result.success || !result.data) return { success: false, data: null, error: errorMsg };

    return { success: true, data: result.data, error: null };
};

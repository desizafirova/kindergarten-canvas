import httpMsg from '@utils/http_messages/http_msg';
import servUpdateUser from '@dao/users/user_update_dao';
import servHashPassword from '@functions/generate_hash_password';
import servFindOneUser from '@dao/users/user_get_one_dao';

const errorCod = 'ERROR_USER_UPDATE_ME';
const errorMsg = 'Failed to update user';

export default async (id: number, data: any) => {
    // Check required user data
    if (!checkRequiredDatas(id)) return httpMsg.http422(errorMsg, errorCod);

    // Check existing user
    const user = await getUser({ id });
    if (!user.success) return httpMsg.http422(user.error || '', errorCod);

    const filtered = await filterDatas(data);
    if (!filtered.success) return httpMsg.http422(errorMsg, errorCod);

    // Update the user
    const updated = await updateUser(user.data.id, filtered.data);
    if (!updated.success) return httpMsg.http422(errorMsg, errorCod);

    return httpMsg.http200(updated.data);
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
        createdAt: true,
        updatedAt: true,
    };

    const result = await servFindOneUser(where, select);

    if (!result.success || !result.data) return { success: false, data: null, error: errorMsg };

    return { success: true, data: result.data, error: null };
};

const updateUser = async (id: number, datas: any) => {
    // Return updated user without password
    const select = {
        id: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
    };

    const result = await servUpdateUser(id, datas, select);

    /* istanbul ignore if */
    if (!result.success || !result.data) return { success: false, data: null };

    return { success: true, data: result.data };
};

const filterDatas = async (data: any) => {
    const dataFiltered: any = {};

    // Only allow updating email and password for simplified User schema
    if (data.email) dataFiltered.email = data.email;

    // Hash password if provided
    if (data.password) {
        const resultHashPassword = await servHashPassword(data.password);
        /* istanbul ignore if */
        if (!resultHashPassword.success || !resultHashPassword.data) {
            return { success: false, data: null };
        }
        dataFiltered.password = resultHashPassword.data;
    }

    return { success: true, data: dataFiltered };
};

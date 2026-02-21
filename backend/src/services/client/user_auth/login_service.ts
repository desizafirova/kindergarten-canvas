import constError from '@constants/error_constant';
import httpMsg from '@utils/http_messages/http_msg';
import servFindOneUser from '@dao/users/user_get_one_dao';
import servCheckPassword from '@functions/check_password';
import servGenerateAccessToken from '@functions/generate_token_access';
import servGenerateRefreshToken from '@functions/generate_token_refresh';

interface LoginData {
    email: string;
    password: string;
}

interface UserData {
    id: number;
    email: string;
    password: string;
    role: string;
}

export default async (data: LoginData) => {
    const errorMsg = constError.LOGIN_MSG.failToLogin;
    const errorCode = constError.ERROR_CODE.login;

    // Check required user data
    if (!checkRequiredDatas(data)) {
        return httpMsg.http422(errorMsg, errorCode);
    }

    // Check existing user and get data
    const user = await getUser({ email: data.email });
    if (!user.success || !user.data) {
        return httpMsg.http401(errorMsg, errorCode);
    }

    // Check password
    const checkedPassword = await checkPassword(data.password, user.data.password);
    if (!checkedPassword) {
        return httpMsg.http401(errorMsg, errorCode);
    }

    // Generate access and refresh tokens
    const tokens = await generateTokens(user.data);
    if (!tokens.success) {
        return httpMsg.http401(errorMsg, errorCode);
    }

    // Build response - user object without password
    const response = {
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        user: {
            id: user.data.id,
            email: user.data.email,
            role: user.data.role,
        },
    };

    return httpMsg.http200(response);
};

const checkRequiredDatas = (datas: LoginData) => {
    if (!datas.email) return false;
    if (!datas.password) return false;
    return true;
};

const getUser = async (where: { email: string }) => {
    const select = {
        id: true,
        email: true,
        password: true,
        role: true,
    };

    const result = await servFindOneUser(where, select);

    if (!result.success || !result.data) {
        return { success: false, data: null, error: constError.LOGIN_MSG.failToLogin };
    }
    if (!result.data.password) {
        return { success: false, data: null, error: constError.LOGIN_MSG.failToLogin };
    }

    return { success: true, data: result.data as UserData, error: null };
};

const checkPassword = async (plainPassword: string, hashPassword: string) => {
    const result = await servCheckPassword(plainPassword, hashPassword);
    if (!result.success) return false;
    return true;
};

const generateTokens = async (userData: UserData) => {
    // Access token payload - contains user info
    const accessTokenPayload = {
        userId: userData.id,
        email: userData.email,
        role: userData.role,
    };

    // Refresh token payload - minimal info
    const refreshTokenPayload = {
        userId: userData.id,
        type: 'refresh' as const,
    };

    const accessTokenResult = await servGenerateAccessToken(accessTokenPayload);
    if (!accessTokenResult.success) {
        return { success: false, accessToken: null, refreshToken: null };
    }

    const refreshTokenResult = await servGenerateRefreshToken(refreshTokenPayload);
    if (!refreshTokenResult.success) {
        return { success: false, accessToken: null, refreshToken: null };
    }

    return {
        success: true,
        accessToken: accessTokenResult.data,
        refreshToken: refreshTokenResult.data,
    };
};

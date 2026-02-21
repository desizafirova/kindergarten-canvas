import jwt, { TokenExpiredError } from 'jsonwebtoken';
import config from '@config/app';
import constError from '@constants/error_constant';
import httpMsg from '@utils/http_messages/http_msg';
import servFindOneUser from '@dao/users/user_get_one_dao';
import servGenerateAccessToken from '@functions/generate_token_access';

interface RefreshTokenPayload {
    userId: number;
    type: 'refresh';
    iat: number;
    exp: number;
}

interface RefreshData {
    refreshToken: string;
}

export default async (data: RefreshData) => {
    const invalidTokenMsg = constError.TOKEN_MSG.invalidRefreshToken;
    const sessionExpiredMsg = constError.TOKEN_MSG.sessionExpired;
    const errorCode = constError.ERROR_CODE.invalidToken;

    // Check required data
    if (!data.refreshToken) {
        return httpMsg.http401(invalidTokenMsg, errorCode);
    }

    // Verify refresh token
    let decoded: RefreshTokenPayload;
    try {
        decoded = jwt.verify(data.refreshToken, config.jwt.secretAdmin) as RefreshTokenPayload;
    } catch (error) {
        // Use specific message for expired tokens (AC2)
        if (error instanceof TokenExpiredError) {
            return httpMsg.http401(sessionExpiredMsg, errorCode);
        }
        return httpMsg.http401(invalidTokenMsg, errorCode);
    }

    // Validate token type
    if (decoded.type !== 'refresh') {
        return httpMsg.http401(invalidTokenMsg, errorCode);
    }

    // Get user from database
    const user = await servFindOneUser(
        { id: decoded.userId },
        { id: true, email: true, role: true }
    );

    if (!user.success || !user.data) {
        return httpMsg.http401(invalidTokenMsg, errorCode);
    }

    // Generate new access token
    const accessTokenPayload = {
        userId: user.data.id,
        email: user.data.email,
        role: user.data.role,
    };

    const accessTokenResult = await servGenerateAccessToken(accessTokenPayload);
    if (!accessTokenResult.success) {
        return httpMsg.http401(invalidTokenMsg, errorCode);
    }

    return httpMsg.http200({
        accessToken: accessTokenResult.data,
    });
};

import jwt from 'jsonwebtoken';
import config from '@config/app';

interface RefreshTokenPayload {
    userId: number;
    type: 'refresh';
}

export default async (tokenData: RefreshTokenPayload) => {
    const token = jwt.sign(tokenData, config.jwt.secretAdmin, {
        expiresIn: config.jwt.refreshExpiredIn,
    });

    return { success: true, data: token, error: null };
};

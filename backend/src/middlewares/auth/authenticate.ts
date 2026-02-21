import passport from 'passport';
import { Request, Response, NextFunction } from 'express';
import httpMsg from '@utils/http_messages/http_msg';
import constError from '@constants/error_constant';

interface AuthenticatedUser {
    id: number;
    email: string;
    role: 'ADMIN' | 'DEVELOPER';
}

const errorCode = 'ERROR_AUTH';

const auth = (platform: string) => (req: Request, res: Response, next: NextFunction) => {
    passport.authenticate(platform, { session: false }, (err: any, user: AuthenticatedUser | null) => {
        if (err) {
            const result = httpMsg.http422(err, errorCode);
            return res.status(result.httpStatusCode).json(result.data);
        }
        if (!user || Object.keys(user).length === 0) {
            const result = httpMsg.http401(constError.TOKEN_MSG.unauthorizedAccess, errorCode);
            return res.status(result.httpStatusCode).json(result.data);
        }
        req.user = user;
        next();
    })(req, res, next);
};

export default auth;

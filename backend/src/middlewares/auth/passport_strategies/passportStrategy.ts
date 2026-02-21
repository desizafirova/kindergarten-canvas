import { Strategy as JWTStrategy, ExtractJwt } from 'passport-jwt';
import { Strategy as LocalStrategy } from 'passport-local';

import config from '@config/app';
import logger from '@utils/logger/winston/logger';
import servFindOneUser from '@dao/users/user_get_one_dao';
import servCheckPassword from '@functions/check_password';
import constError from '@constants/error_constant';

const errorMsg = constError.TOKEN_MSG.unauthorizedAccess;

const localUserOpts = {
    usernameField: 'email',
    passwordField: 'password',
};

const jwtUserOpts = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: config.jwt.secretAdmin,
};

const jwtUserStrategy = async (passport: any) => {
    passport.use(
        'jwt-user',
        new JWTStrategy(jwtUserOpts, async (payload, done) => {
            try {
                const newUser = await getUser({ id: payload.userId });
                if (!newUser.success) return done(errorMsg, {});

                return newUser.data ? done(null, newUser.data) : done(null, {});
            } catch (err) {
                logger.error(`JWT passport strategy error: ${err})`);
                return done(err, {});
            }
        }),
    );
};

const localUserStrategy = async (passport: any) => {
    passport.use(
        'login-user',
        new LocalStrategy(localUserOpts, async (email, password, done) => {
            try {
                // Check user
                const newUser = await getUser({ email });

                if (!newUser.success) return done(errorMsg, {});
                if (!newUser.data) return done(null, {});

                // Check password
                const checkedPassword = await checkPassword(password, newUser.data.password);
                if (!checkedPassword) return done(null, {});

                // Remove password before returning user data
                const userData = {
                    id: newUser.data.id,
                    email: newUser.data.email,
                    role: newUser.data.role,
                };

                return done(null, userData);
            } catch (err) {
                logger.error(`JWT passport strategy error: ${err})`);
                return done(err, {});
            }
        }),
    );
};

const getUser = async (where: { email?: string; id?: number }) => {
    const select = {
        id: true,
        email: true,
        password: true,
        role: true,
    };

    // Get user by email or id
    const result = await servFindOneUser(where, select);
    if (!result.success) return { success: false, data: null };

    return { success: true, data: result.data, error: null };
};

const checkPassword = async (plainPassword: string, hashPassword: string) => {
    const result = await servCheckPassword(plainPassword, hashPassword);

    if (!result.success) return false;

    return true;
};

export { localUserStrategy, jwtUserStrategy };

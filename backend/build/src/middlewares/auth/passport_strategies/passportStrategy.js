"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.jwtUserStrategy = exports.localUserStrategy = void 0;
const passport_jwt_1 = require("passport-jwt");
const passport_local_1 = require("passport-local");
const app_1 = __importDefault(require("../../../config/app"));
const logger_1 = __importDefault(require("../../../utils/logger/winston/logger"));
const user_get_one_dao_1 = __importDefault(require("../../../dao/users/user_get_one_dao"));
const check_password_1 = __importDefault(require("../../../functions/check_password"));
const error_constant_1 = __importDefault(require("../../../constants/error_constant"));
const errorMsg = error_constant_1.default.TOKEN_MSG.unauthorizedAccess;
const localUserOpts = {
    usernameField: 'email',
    passwordField: 'password',
};
const jwtUserOpts = {
    jwtFromRequest: passport_jwt_1.ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: app_1.default.jwt.secretAdmin,
};
const jwtUserStrategy = async (passport) => {
    passport.use('jwt-user', new passport_jwt_1.Strategy(jwtUserOpts, async (payload, done) => {
        try {
            const newUser = await getUser({ id: payload.userId });
            if (!newUser.success)
                return done(errorMsg, {});
            return newUser.data ? done(null, newUser.data) : done(null, {});
        }
        catch (err) {
            logger_1.default.error(`JWT passport strategy error: ${err})`);
            return done(err, {});
        }
    }));
};
exports.jwtUserStrategy = jwtUserStrategy;
const localUserStrategy = async (passport) => {
    passport.use('login-user', new passport_local_1.Strategy(localUserOpts, async (email, password, done) => {
        try {
            const newUser = await getUser({ email });
            if (!newUser.success)
                return done(errorMsg, {});
            if (!newUser.data)
                return done(null, {});
            const checkedPassword = await checkPassword(password, newUser.data.password);
            if (!checkedPassword)
                return done(null, {});
            const userData = {
                id: newUser.data.id,
                email: newUser.data.email,
                role: newUser.data.role,
            };
            return done(null, userData);
        }
        catch (err) {
            logger_1.default.error(`JWT passport strategy error: ${err})`);
            return done(err, {});
        }
    }));
};
exports.localUserStrategy = localUserStrategy;
const getUser = async (where) => {
    const select = {
        id: true,
        email: true,
        password: true,
        role: true,
    };
    const result = await (0, user_get_one_dao_1.default)(where, select);
    if (!result.success)
        return { success: false, data: null };
    return { success: true, data: result.data, error: null };
};
const checkPassword = async (plainPassword, hashPassword) => {
    const result = await (0, check_password_1.default)(plainPassword, hashPassword);
    if (!result.success)
        return false;
    return true;
};
//# sourceMappingURL=passportStrategy.js.map
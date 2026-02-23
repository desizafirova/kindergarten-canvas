"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const testConfig = (env) => {
    return {
        auth: {
            type: 'OAuth2',
        },
        smtp: {
            service: env.EMAIL_SERVICE || 'gmail',
            user: env.EMAIL_USER || 'admin',
            password: env.EMAIL_PASSWORD || '',
        },
        oauth: {
            clientId: env.EMAIL_OAUTH_CLIENT_ID || '',
            clientSecret: env.EMAIL_OAUTH_CLIENT_SECRET || '',
            refreshToken: env.EMAIL_OAUTH_REFRESH_TOKEN || '',
            redirect: env.EMAIL_OAUTH_REDIRECT || '',
        },
        debug: {
            debug: true,
            logger: true,
        },
    };
};
const devConfig = (env) => {
    return {
        auth: {
            type: 'OAuth2',
        },
        smtp: {
            service: env.EMAIL_SERVICE || 'gmail',
            user: env.EMAIL_USER || 'admin',
            password: env.EMAIL_PASSWORD || '',
        },
        oauth: {
            clientId: env.EMAIL_OAUTH_CLIENT_ID || '',
            clientSecret: env.EMAIL_OAUTH_CLIENT_SECRET || '',
            refreshToken: env.EMAIL_OAUTH_REFRESH_TOKEN || '',
            redirect: env.EMAIL_OAUTH_REDIRECT || '',
        },
        debug: {
            debug: true,
            logger: true,
        },
    };
};
const stageConfig = (env) => {
    return {
        auth: {
            type: 'OAuth2',
        },
        smtp: {
            service: env.SMTP_SERVICE || 'gmail',
            user: env.SMTP_USER || 'admin',
            password: env.SMTP_PASSWORD || '',
        },
        oauth: {
            clientId: env.OAUTH_CLIENTID || '',
            clientSecret: env.OAUTH_CLIENT_SECRET || '',
            refreshToken: env.OAUTH_REFRESH_TOKEN || '',
            redirect: env.EMAIL_OAUTH_REDIRECT || '',
        },
        debug: {
            debug: false,
            logger: false,
        },
    };
};
const prodConfig = (env) => {
    return {
        auth: {
            type: 'OAuth2',
        },
        smtp: {
            service: env.SMTP_SERVICE || 'gmail',
            user: env.SMTP_USER || 'admin',
            password: env.SMTP_PASSWORD || '',
        },
        oauth: {
            clientId: env.OAUTH_CLIENTID || '',
            clientSecret: env.OAUTH_CLIENT_SECRET || '',
            refreshToken: env.OAUTH_REFRESH_TOKEN || '',
            redirect: env.EMAIL_OAUTH_REDIRECT || '',
        },
        debug: {
            debug: false,
            logger: false,
        },
    };
};
exports.default = { testConfig, devConfig, stageConfig, prodConfig };
//# sourceMappingURL=config_email.js.map
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const nodemailer_1 = __importDefault(require("nodemailer"));
const google_auth_library_1 = require("google-auth-library");
const email_1 = __importDefault(require("../../../../config/email"));
const logger_1 = __importDefault(require("../../../logger/winston/logger"));
const OAuth2 = google_auth_library_1.OAuth2Client;
const transporter = async () => {
    let transporter;
    try {
        const oauth2Client = new OAuth2(email_1.default.oauth.clientId, email_1.default.oauth.clientSecret, email_1.default.oauth.redirect);
        oauth2Client.setCredentials({
            refresh_token: email_1.default.oauth.refreshToken,
        });
        let accessToken;
        oauth2Client
            .refreshAccessToken()
            .then((tokens) => (accessToken = tokens.credentials.access_token))
            .catch((err) => logger_1.default.error(`Nodemailer - OAuth2 Refresh token error. ${err}`));
        transporter = nodemailer_1.default.createTransport({
            service: String(email_1.default.smtp.service),
            auth: {
                type: 'OAuth2',
                user: String(email_1.default.smtp.user),
                clientId: String(email_1.default.oauth.clientId),
                clientSecret: String(email_1.default.oauth.clientSecret),
                refreshToken: String(email_1.default.oauth.refreshToken),
                accessToken: String(accessToken),
                expires: 3600,
            },
        });
    }
    catch (err) {
        logger_1.default.error(`Nodemailer - OAuth2 error. ${err}`);
    }
    return transporter;
};
exports.default = transporter;
//# sourceMappingURL=oauth_client.js.map
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const logger_1 = __importDefault(require("../../../logger/winston/logger"));
const oauth_client_1 = __importDefault(require("../../../mailer/nodemailer/core/oauth_client"));
const errorSendEmail = 'Error to send e-mail.';
exports.default = async (options) => {
    try {
        const emailTransporter = await (0, oauth_client_1.default)();
        if (emailTransporter) {
            const sendEmail = await emailTransporter
                .sendMail(options)
                .then(() => ({ success: true, data: null }))
                .catch((err) => {
                logger_1.default.error(`${errorSendEmail} ${err}`);
                return { success: false, data: err };
            });
            if (!sendEmail.success)
                false;
        }
        else {
            return false;
        }
    }
    catch (err) {
        logger_1.default.error(`Nodemailer transporter error. ${err}`);
    }
    return true;
};
//# sourceMappingURL=transporter.js.map
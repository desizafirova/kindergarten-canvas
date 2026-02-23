"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const ejs_1 = __importDefault(require("ejs"));
const transporter_1 = __importDefault(require("./core/transporter"));
const email_1 = __importDefault(require("../../../config/email"));
exports.default = async (template, data) => {
    const htmlText = await ejs_1.default.renderFile(template.path, data || null);
    const options = {
        from: email_1.default.smtp.user,
        to: data.email,
        text: template.subject,
        subject: template.subject,
        html: htmlText,
    };
    const sender = await (0, transporter_1.default)(options);
    return sender;
};
//# sourceMappingURL=sender.js.map
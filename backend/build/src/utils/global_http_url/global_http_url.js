"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = __importDefault(require("../../config/app"));
exports.default = () => {
    let url;
    app_1.default.ssl.isHttps === true
        ? (url = `https://${app_1.default.app.host}:${app_1.default.app.port}`)
        : (url = `http://${app_1.default.app.host}:${app_1.default.app.port}`);
    return url;
};
//# sourceMappingURL=global_http_url.js.map
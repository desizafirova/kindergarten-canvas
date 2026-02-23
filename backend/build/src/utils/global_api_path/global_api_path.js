"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = __importDefault(require("../../config/app"));
exports.default = () => {
    let path = '';
    if (app_1.default.api.prefix)
        path = `/${app_1.default.api.prefix}`;
    return path;
};
//# sourceMappingURL=global_api_path.js.map
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const show_all_service_1 = __importDefault(require("../../admin/users/show_all_service"));
const user_show_me_service_1 = __importDefault(require("./user_show_me_service"));
const user_update_me_service_1 = __importDefault(require("./user_update_me_service"));
const user_delete_me_service_1 = __importDefault(require("./user_delete_me_service"));
exports.default = {
    showAll: show_all_service_1.default,
    showMe: user_show_me_service_1.default,
    updateMe: user_update_me_service_1.default,
    deleteMe: user_delete_me_service_1.default,
};
//# sourceMappingURL=index.js.map
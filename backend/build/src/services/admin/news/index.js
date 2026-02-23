"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const news_get_all_service_1 = __importDefault(require("./news_get_all_service"));
const news_get_one_service_1 = __importDefault(require("./news_get_one_service"));
const news_create_service_1 = __importDefault(require("./news_create_service"));
const news_update_service_1 = __importDefault(require("./news_update_service"));
const news_delete_service_1 = __importDefault(require("./news_delete_service"));
exports.default = {
    getAll: news_get_all_service_1.default,
    getOne: news_get_one_service_1.default,
    create: news_create_service_1.default,
    update: news_update_service_1.default,
    remove: news_delete_service_1.default,
};
//# sourceMappingURL=index.js.map
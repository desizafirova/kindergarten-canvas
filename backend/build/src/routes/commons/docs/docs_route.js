"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const swagger_ui_express_1 = __importDefault(require("swagger-ui-express"));
const _packagejson_1 = __importDefault(require("../../../../package.json"));
const postman_to_swagger_1 = __importDefault(require("../../../utils/swagger/postman_to_swagger"));
const router = (0, express_1.Router)();
const options = {
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: `Doc ${_packagejson_1.default.name}`,
    customfavIcon: '/assets/images/favicons/favicon.ico',
};
const doc = async () => {
    router.use('/', swagger_ui_express_1.default.serve);
    router.get('/', swagger_ui_express_1.default.setup(await (0, postman_to_swagger_1.default)(), options));
};
doc();
exports.default = router;
//# sourceMappingURL=docs_route.js.map
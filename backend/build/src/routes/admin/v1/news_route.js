"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authenticate_1 = __importDefault(require("../../../middlewares/auth/authenticate"));
const validade_schema_1 = require("../../../middlewares/validate_schema/validade_schema");
const news_controller_1 = __importDefault(require("../../../controllers/admin/news_controller"));
const news_schema_1 = require("../../../schemas/news_schema");
const router = (0, express_1.Router)();
router.get('/', (0, authenticate_1.default)('jwt-user'), (0, validade_schema_1.validate)(news_schema_1.getNewsList), news_controller_1.default.getAll);
router.get('/:id', (0, authenticate_1.default)('jwt-user'), (0, validade_schema_1.validate)(news_schema_1.getNewsById), news_controller_1.default.getOne);
router.post('/', (0, authenticate_1.default)('jwt-user'), (0, validade_schema_1.validate)(news_schema_1.createNews), news_controller_1.default.create);
router.put('/:id', (0, authenticate_1.default)('jwt-user'), (0, validade_schema_1.validate)(news_schema_1.updateNews), news_controller_1.default.update);
router.delete('/:id', (0, authenticate_1.default)('jwt-user'), (0, validade_schema_1.validate)(news_schema_1.getNewsById), news_controller_1.default.remove);
exports.default = router;
//# sourceMappingURL=news_route.js.map
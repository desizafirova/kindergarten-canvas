"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const commons_controller_1 = __importDefault(require("../../../controllers/commons/commons_controller"));
const router = (0, express_1.Router)();
router.get('/', commons_controller_1.default.info);
exports.default = router;
//# sourceMappingURL=info_route.js.map
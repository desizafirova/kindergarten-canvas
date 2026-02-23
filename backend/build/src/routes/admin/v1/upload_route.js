"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authenticate_1 = __importDefault(require("../../../middlewares/auth/authenticate"));
const multer_config_1 = __importDefault(require("../../../config/multer.config"));
const upload_controller_1 = __importDefault(require("../../../controllers/admin/upload_controller"));
const router = (0, express_1.Router)();
router.post('/', (0, authenticate_1.default)('jwt-user'), multer_config_1.default.single('file'), upload_controller_1.default.uploadImage);
exports.default = router;
//# sourceMappingURL=upload_route.js.map
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authenticate_1 = __importDefault(require("../../../middlewares/auth/authenticate"));
const users_me_controller_1 = __importDefault(require("../../../controllers/client/users_me_controller"));
const router = (0, express_1.Router)();
router.get('/', (0, authenticate_1.default)('jwt-user'), users_me_controller_1.default.showMe);
router.patch('/', (0, authenticate_1.default)('jwt-user'), users_me_controller_1.default.updateMe);
router.delete('/', (0, authenticate_1.default)('jwt-user'), users_me_controller_1.default.deleteMe);
exports.default = router;
//# sourceMappingURL=user_me_route.js.map
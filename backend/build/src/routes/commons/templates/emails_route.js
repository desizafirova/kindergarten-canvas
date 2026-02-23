"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const templates_emails_controller_1 = __importDefault(require("../../../controllers/commons/templates/templates_emails_controller"));
const router = (0, express_1.Router)();
router.get('/welcome-user', templates_emails_controller_1.default.userWelcome);
router.get('/email-verify', templates_emails_controller_1.default.userEmailVerify);
router.get('/password-request', templates_emails_controller_1.default.userPasswordRequest);
router.get('/password-reseted', templates_emails_controller_1.default.userPasswordReseted);
exports.default = router;
//# sourceMappingURL=emails_route.js.map
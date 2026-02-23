"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const user_auth_route_1 = __importDefault(require("./user_auth_route"));
const user_me_route_1 = __importDefault(require("./user_me_route"));
const router = (0, express_1.Router)();
const defaultRoutes = [
    {
        path: '/auth',
        route: user_auth_route_1.default,
    },
    {
        path: '/user/me',
        route: user_me_route_1.default,
    },
];
defaultRoutes.forEach((route) => {
    router.use(route.path, route.route);
});
exports.default = router;
//# sourceMappingURL=index.js.map
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const users_route_1 = __importDefault(require("./users_route"));
const news_route_1 = __importDefault(require("./news_route"));
const upload_route_1 = __importDefault(require("./upload_route"));
const router = (0, express_1.Router)();
const defaultRoutes = [
    {
        path: '/users',
        route: users_route_1.default,
    },
    {
        path: '/news',
        route: news_route_1.default,
    },
    {
        path: '/upload',
        route: upload_route_1.default,
    },
];
defaultRoutes.forEach((route) => {
    router.use(route.path, route.route);
});
exports.default = router;
//# sourceMappingURL=index.js.map
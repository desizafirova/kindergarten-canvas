import { Router } from 'express';
import usersRoute from './users_route';
import newsRoute from './news_route';

const router = Router();

const defaultRoutes = [
    {
        path: '/users',
        route: usersRoute,
    },
    {
        path: '/news',
        route: newsRoute,
    },
];

defaultRoutes.forEach((route) => {
    router.use(route.path, route.route);
});

export default router;

import { Router } from 'express';
import usersRoute from './users_route';
import newsRoute from './news_route';
import uploadRoute from './upload_route';
import teacherRoute from './teacher_route';
import eventRoute from './event_route';
import deadlineRoute from './deadline_route';
import jobRoute from './job_route';
import galleryRoute from './gallery_route';
import subscriberRoute from './subscriber_route';

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
    {
        path: '/upload',
        route: uploadRoute,
    },
    {
        path: '/teachers',
        route: teacherRoute,
    },
    {
        path: '/events',
        route: eventRoute,
    },
    {
        path: '/admission-deadlines',
        route: deadlineRoute,
    },
    {
        path: '/jobs',
        route: jobRoute,
    },
    {
        path: '/galleries',
        route: galleryRoute,
    },
    {
        path: '/subscribers',
        route: subscriberRoute,
    },
];

defaultRoutes.forEach((route) => {
    router.use(route.path, route.route);
});

export default router;

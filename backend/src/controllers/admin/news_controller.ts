import { Request, Response, NextFunction } from 'express';
import newsServices from '@services/admin/news';
import logger from '@utils/logger/winston/logger';

const getAll = (req: Request, res: Response, next: NextFunction) => {
    const { status } = req.query;
    newsServices
        .getAll(status as string | undefined)
        .then((result: any) => res.status(result.httpStatusCode).json(result.data))
        .catch((err: any) => {
            logger.error(`Error listing news items. ${err.message}`);
            next(err);
        });
};

const getOne = (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    newsServices
        .getOne(Number(id))
        .then((result: any) => res.status(result.httpStatusCode).json(result.data))
        .catch((err: any) => {
            logger.error(`Error getting news item. ${err.message}`);
            next(err);
        });
};

const create = (req: Request, res: Response, next: NextFunction) => {
    newsServices
        .create(req.body)
        .then((result: any) => res.status(result.httpStatusCode).json(result.data))
        .catch((err: any) => {
            logger.error(`Error creating news item. ${err.message}`);
            next(err);
        });
};

const update = (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    newsServices
        .update(Number(id), req.body)
        .then((result: any) => res.status(result.httpStatusCode).json(result.data))
        .catch((err: any) => {
            logger.error(`Error updating news item. ${err.message}`);
            next(err);
        });
};

const remove = (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    newsServices
        .remove(Number(id))
        .then((result: any) => res.status(result.httpStatusCode).json(result.data))
        .catch((err: any) => {
            logger.error(`Error deleting news item. ${err.message}`);
            next(err);
        });
};

export default {
    getAll,
    getOne,
    create,
    update,
    remove,
};

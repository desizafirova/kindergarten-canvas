import { Request, Response, NextFunction } from 'express';
import eventServices from '@services/admin/event';
import logger from '@utils/logger/winston/logger';

const getAll = (req: Request, res: Response, next: NextFunction) => {
    const { status, upcoming } = req.query;
    eventServices
        .getAll(status as string | undefined, upcoming as string | undefined)
        .then((result: any) => res.status(result.httpStatusCode).json(result.data))
        .catch((err: any) => {
            logger.error(`Error listing events. ${err.message}`);
            next(err);
        });
};

const getOne = (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    eventServices
        .getOne(Number(id))
        .then((result: any) => res.status(result.httpStatusCode).json(result.data))
        .catch((err: any) => {
            logger.error(`Error getting event. ${err.message}`);
            next(err);
        });
};

const create = (req: Request, res: Response, next: NextFunction) => {
    eventServices
        .create(req.body)
        .then((result: any) => res.status(result.httpStatusCode).json(result.data))
        .catch((err: any) => {
            logger.error(`Error creating event. ${err.message}`);
            next(err);
        });
};

const update = (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    eventServices
        .update(Number(id), req.body)
        .then((result: any) => res.status(result.httpStatusCode).json(result.data))
        .catch((err: any) => {
            logger.error(`Error updating event. ${err.message}`);
            next(err);
        });
};

const remove = (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    eventServices
        .remove(Number(id))
        .then((result: any) => res.status(result.httpStatusCode).json(result.data))
        .catch((err: any) => {
            logger.error(`Error deleting event. ${err.message}`);
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

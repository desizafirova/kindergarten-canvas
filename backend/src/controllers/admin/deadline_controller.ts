import { Request, Response, NextFunction } from 'express';
import deadlineServices from '@services/admin/deadline';
import logger from '@utils/logger/winston/logger';

const getAll = (req: Request, res: Response, next: NextFunction) => {
    const { status, upcoming } = req.query;
    deadlineServices
        .getAll(status as string | undefined, upcoming as string | undefined)
        .then((result: any) => res.status(result.httpStatusCode).json(result.data))
        .catch((err: any) => {
            logger.error(`Error listing deadlines. ${err.message}`);
            next(err);
        });
};

const getOne = (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    deadlineServices
        .getOne(Number(id))
        .then((result: any) => res.status(result.httpStatusCode).json(result.data))
        .catch((err: any) => {
            logger.error(`Error getting deadline. ${err.message}`);
            next(err);
        });
};

const create = (req: Request, res: Response, next: NextFunction) => {
    deadlineServices
        .create(req.body)
        .then((result: any) => res.status(result.httpStatusCode).json(result.data))
        .catch((err: any) => {
            logger.error(`Error creating deadline. ${err.message}`);
            next(err);
        });
};

const update = (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    deadlineServices
        .update(Number(id), req.body)
        .then((result: any) => res.status(result.httpStatusCode).json(result.data))
        .catch((err: any) => {
            logger.error(`Error updating deadline. ${err.message}`);
            next(err);
        });
};

const remove = (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    deadlineServices
        .remove(Number(id))
        .then((result: any) => res.status(result.httpStatusCode).json(result.data))
        .catch((err: any) => {
            logger.error(`Error deleting deadline. ${err.message}`);
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

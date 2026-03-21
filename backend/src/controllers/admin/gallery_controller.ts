import { Request, Response, NextFunction } from 'express';
import galleryServices from '@services/admin/gallery';
import logger from '@utils/logger/winston/logger';

const getAll = (req: Request, res: Response, next: NextFunction) => {
    const { status } = req.query;
    galleryServices
        .getAll(status as string | undefined)
        .then((result: any) => res.status(result.httpStatusCode).json(result.data))
        .catch((err: any) => {
            logger.error(`Error listing galleries. ${err.message}`);
            next(err);
        });
};

const getOne = (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    galleryServices
        .getOne(Number(id))
        .then((result: any) => res.status(result.httpStatusCode).json(result.data))
        .catch((err: any) => {
            logger.error(`Error getting gallery. ${err.message}`);
            next(err);
        });
};

const create = (req: Request, res: Response, next: NextFunction) => {
    galleryServices
        .create(req.body)
        .then((result: any) => res.status(result.httpStatusCode).json(result.data))
        .catch((err: any) => {
            logger.error(`Error creating gallery. ${err.message}`);
            next(err);
        });
};

const update = (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    galleryServices
        .update(Number(id), req.body)
        .then((result: any) => res.status(result.httpStatusCode).json(result.data))
        .catch((err: any) => {
            logger.error(`Error updating gallery. ${err.message}`);
            next(err);
        });
};

const remove = (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    galleryServices
        .remove(Number(id))
        .then((result: any) => res.status(result.httpStatusCode).json(result.data))
        .catch((err: any) => {
            logger.error(`Error deleting gallery. ${err.message}`);
            next(err);
        });
};

const addImage = (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    galleryServices
        .addImage(Number(id), req.file)
        .then((result: any) => res.status(result.httpStatusCode).json(result.data))
        .catch((err: any) => {
            logger.error(`Error adding gallery image. ${err.message}`);
            next(err);
        });
};

const removeImage = (req: Request, res: Response, next: NextFunction) => {
    const { id, imageId } = req.params;
    galleryServices
        .removeImage(Number(id), Number(imageId))
        .then((result: any) => res.status(result.httpStatusCode).json(result.data))
        .catch((err: any) => {
            logger.error(`Error removing gallery image. ${err.message}`);
            next(err);
        });
};

const reorderImages = (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    galleryServices
        .reorderImages(Number(id), req.body.images)
        .then((result: any) => res.status(result.httpStatusCode).json(result.data))
        .catch((err: any) => {
            logger.error(`Error reordering gallery images. ${err.message}`);
            next(err);
        });
};

export default { getAll, getOne, create, update, remove, addImage, removeImage, reorderImages };

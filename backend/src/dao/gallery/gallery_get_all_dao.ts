import prisma from '../../../prisma/prisma-client';
import logger from '@utils/logger/winston/logger';

const msgError = 'Failed to get all galleries.';

export default (where: object, select: object, orderBy: object) => {
    return prisma.gallery
        .findMany({ where, select: select as any, orderBy })
        .then((res: any) => ({ success: true, data: res, error: null }))
        .catch((error: any) => {
            logger.error(`${msgError} ${error}`);
            return { success: false, data: null, error: msgError };
        });
};

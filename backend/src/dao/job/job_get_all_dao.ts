import prisma from '../../../prisma/prisma-client';
import logger from '@utils/logger/winston/logger';

const msgError = 'Failed to get all jobs.';

export default (where: object, select: object, orderBy: object) => {
    const result = prisma.job
        .findMany({ where, select, orderBy })
        .then((res: any) => ({ success: true, data: res, error: null }))
        .catch((error: any) => {
            logger.error(`${msgError} ${error}`);
            return { success: false, data: null, error: msgError };
        });
    return result;
};

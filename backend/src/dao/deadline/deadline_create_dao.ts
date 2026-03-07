import prisma from '../../../prisma/prisma-client';
import logger from '@utils/logger/winston/logger';

const msgError = 'Failed to create a deadline.';

export default (data: object, select: object) => {
    const result = prisma.deadline
        .create({ data: data as any, select })
        .then((res: any) => ({ success: true, data: res, error: null }))
        .catch((error: Error) => {
            logger.error(`${msgError} ${error}`);
            return { success: false, data: null, error: msgError };
        });

    return result;
};

import prisma from '../../../prisma/prisma-client';
import logger from '@utils/logger/winston/logger';

const msgError = 'Failed to get teacher.';

export default (id: number, select: object) => {
    const result = prisma.teacher
        .findUnique({ where: { id }, select })
        .then((res: any) => {
            return { success: true, data: res, error: null };
        })
        .catch((error: any) => {
            logger.error(`${msgError} ${error}`);
            return { success: false, data: null, error: msgError };
        });

    return result;
};

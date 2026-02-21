import prisma from '../../../prisma/prisma-client';
import logger from '@utils/logger/winston/logger';

const msgError = 'Failed to update news item.';

export default (id: number, data: object, select: object) => {
    const result = prisma.newsItem
        .update({ where: { id }, data: data as any, select })
        .then((res) => ({ success: true, data: res, error: null }))
        .catch((error: Error) => {
            logger.error(`${msgError} ${error}`);
            return {
                success: false,
                data: null,
                error: `${msgError}`,
            };
        });

    return result;
};

import prisma from '../../../prisma/prisma-client';
import logger from '@utils/logger/winston/logger';

const msgError = 'Failed to delete news item.';

export default (id: number) => {
    const result = prisma.newsItem
        .delete({ where: { id } })
        .then((res: any) => ({ success: true, data: res, error: null }))
        .catch((error: any) => {
            logger.error(`${msgError} ${error}`);
            return {
                success: false,
                data: null,
                error: `${msgError}`,
            };
        });

    return result;
};

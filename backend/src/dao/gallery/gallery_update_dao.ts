import prisma from '../../../prisma/prisma-client';
import logger from '@utils/logger/winston/logger';

const msgError = 'Failed to update gallery.';

export default (id: number, data: object, select: object) => {
    return prisma.gallery
        .update({ where: { id }, data: data as any, select: select as any })
        .then((res: any) => ({ success: true, data: res, error: null }))
        .catch((error: any) => {
            logger.error(`${msgError} ${error}`);
            return { success: false, data: null, error: msgError };
        });
};

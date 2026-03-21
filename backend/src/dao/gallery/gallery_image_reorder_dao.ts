import prisma from '../../../prisma/prisma-client';
import logger from '@utils/logger/winston/logger';

const msgError = 'Failed to reorder gallery images.';

export default async (images: { id: number; displayOrder: number }[], select: object) => {
    return prisma
        .$transaction(
            images.map(({ id, displayOrder }) =>
                prisma.galleryImage.update({
                    where: { id },
                    data: { displayOrder },
                    select: select as any,
                })
            )
        )
        .then((res: any) => ({ success: true, data: res, error: null }))
        .catch((error: any) => {
            logger.error(`${msgError} ${error}`);
            return { success: false, data: null, error: msgError };
        });
};

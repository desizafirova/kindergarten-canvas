import { z } from 'zod';

export const createGallery = z.object({
    body: z.object({
        title: z
            .string({ required_error: 'Заглавието е задължително' })
            .min(1, 'Заглавието е задължително'),
        description: z.string().optional().nullable(),
        status: z.enum(['DRAFT', 'PUBLISHED']).optional(),
    }),
});

export const updateGallery = z.object({
    params: z.object({
        id: z.string().transform(Number).pipe(z.number().int().positive()),
    }),
    body: z.object({
        title: z.string().min(1).optional(),
        description: z.string().optional().nullable(),
        status: z.enum(['DRAFT', 'PUBLISHED']).optional(),
    }),
});

export const getGalleryById = z.object({
    params: z.object({
        id: z.string().transform(Number).pipe(z.number().int().positive()),
    }),
});

export const getGalleryList = z.object({
    query: z.object({
        status: z.enum(['DRAFT', 'PUBLISHED']).optional(),
    }),
});

export const addGalleryImage = z.object({
    params: z.object({
        id: z.string().transform(Number).pipe(z.number().int().positive()),
    }),
});

export const deleteGalleryImage = z.object({
    params: z.object({
        id: z.string().transform(Number).pipe(z.number().int().positive()),
        imageId: z.string().transform(Number).pipe(z.number().int().positive()),
    }),
});

export const reorderGalleryImages = z.object({
    params: z.object({
        id: z.string().transform(Number).pipe(z.number().int().positive()),
    }),
    body: z.object({
        images: z
            .array(
                z.object({
                    id: z.number().int().positive(),
                    displayOrder: z.number().int().min(0),
                })
            )
            .min(1, 'Необходимо е поне едно изображение'),
    }),
});

export type CreateGalleryType = z.infer<typeof createGallery>;
export type UpdateGalleryType = z.infer<typeof updateGallery>;
export type GetGalleryByIdType = z.infer<typeof getGalleryById>;
export type GetGalleryListType = z.infer<typeof getGalleryList>;
export type AddGalleryImageType = z.infer<typeof addGalleryImage>;
export type DeleteGalleryImageType = z.infer<typeof deleteGalleryImage>;
export type ReorderGalleryImagesType = z.infer<typeof reorderGalleryImages>;

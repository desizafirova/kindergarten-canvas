import { z } from 'zod';

export const createNews = z.object({
    body: z.object({
        title: z
            .string({
                required_error: 'Заглавието е задължително',
            })
            .min(1, 'Заглавието е задължително'),
        content: z
            .string({
                required_error: 'Съдържанието е задължително',
            })
            .min(1, 'Съдържанието е задължително'),
        imageUrl: z.string().url().optional(),
        status: z.enum(['DRAFT', 'PUBLISHED']).optional(),
    }),
});

export const updateNews = z.object({
    params: z.object({
        id: z.string().transform(Number), // Convert string param to number
    }),
    body: z.object({
        title: z.string().min(1).optional(),
        content: z.string().min(1).optional(),
        imageUrl: z.string().url().optional().nullable(),
        status: z.enum(['DRAFT', 'PUBLISHED']).optional(),
        publishedAt: z.string().datetime().optional().nullable(),
    }),
});

export const getNewsById = z.object({
    params: z.object({
        id: z.string().transform(Number),
    }),
});

export const getNewsList = z.object({
    query: z.object({
        status: z.enum(['DRAFT', 'PUBLISHED']).optional(),
    }),
});

export type CreateNewsType = z.infer<typeof createNews>;
export type UpdateNewsType = z.infer<typeof updateNews>;
export type GetNewsByIdType = z.infer<typeof getNewsById>;
export type GetNewsListType = z.infer<typeof getNewsList>;

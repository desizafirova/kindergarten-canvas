import { z } from 'zod';

export const createDeadline = z.object({
    body: z.object({
        title: z
            .string({ required_error: 'Заглавието е задължително' })
            .min(1, 'Заглавието е задължително'),
        deadlineDate: z
            .string({ required_error: 'Крайната дата е задължителна' })
            .datetime('INVALID_DATE'),
        description: z.string().optional().nullable(),
        isUrgent: z.boolean().optional(),
        status: z.enum(['DRAFT', 'PUBLISHED']).optional(),
    }),
});

export const updateDeadline = z.object({
    params: z.object({
        id: z.string().transform(Number).pipe(z.number().int().positive()),
    }),
    body: z.object({
        title: z.string().min(1).optional(),
        deadlineDate: z.string().datetime('INVALID_DATE').optional(),
        description: z.string().optional().nullable(),
        isUrgent: z.boolean().optional(),
        status: z.enum(['DRAFT', 'PUBLISHED']).optional(),
    }),
});

export const getDeadlineById = z.object({
    params: z.object({
        id: z.string().transform(Number).pipe(z.number().int().positive()),
    }),
});

export const getDeadlineList = z.object({
    query: z.object({
        status: z.enum(['DRAFT', 'PUBLISHED']).optional(),
        upcoming: z.enum(['true', 'false']).optional(),
    }),
});

export type CreateDeadlineType = z.infer<typeof createDeadline>;
export type UpdateDeadlineType = z.infer<typeof updateDeadline>;
export type GetDeadlineByIdType = z.infer<typeof getDeadlineById>;
export type GetDeadlineListType = z.infer<typeof getDeadlineList>;

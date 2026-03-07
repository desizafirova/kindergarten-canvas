import { z } from 'zod';

export const createEvent = z.object({
    body: z.object({
        title: z
            .string({ required_error: 'Заглавието е задължително' })
            .min(1, 'Заглавието е задължително'),
        eventDate: z
            .string({ required_error: 'Датата е задължителна' })
            .datetime('INVALID_DATE'),
        eventEndDate: z.string().datetime('INVALID_DATE').optional().nullable(),
        location: z.string().optional().nullable(),
        description: z.string().optional().nullable(),
        isImportant: z.boolean().optional(),
        imageUrl: z
            .string()
            .url()
            .optional()
            .nullable()
            .or(z.literal(''))
            .transform((val) => (val === '' ? null : val)),
        status: z.enum(['DRAFT', 'PUBLISHED']).optional(),
    }),
});

export const updateEvent = z.object({
    params: z.object({
        id: z.string().transform(Number).pipe(z.number().int().positive()),
    }),
    body: z.object({
        title: z.string().min(1).optional(),
        eventDate: z.string().datetime('INVALID_DATE').optional(),
        eventEndDate: z.string().datetime('INVALID_DATE').optional().nullable(),
        location: z.string().optional().nullable(),
        description: z.string().optional().nullable(),
        isImportant: z.boolean().optional(),
        imageUrl: z
            .string()
            .url()
            .optional()
            .nullable()
            .or(z.literal(''))
            .transform((val) => (val === '' ? null : val)),
        status: z.enum(['DRAFT', 'PUBLISHED']).optional(),
    }),
});

export const getEventById = z.object({
    params: z.object({
        id: z.string().transform(Number).pipe(z.number().int().positive()),
    }),
});

export const getEventList = z.object({
    query: z.object({
        status: z.enum(['DRAFT', 'PUBLISHED']).optional(),
        upcoming: z.enum(['true', 'false']).optional(),
    }),
});

export type CreateEventType = z.infer<typeof createEvent>;
export type UpdateEventType = z.infer<typeof updateEvent>;
export type GetEventByIdType = z.infer<typeof getEventById>;
export type GetEventListType = z.infer<typeof getEventList>;

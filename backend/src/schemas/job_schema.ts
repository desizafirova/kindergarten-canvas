import { z } from 'zod';

export const createJob = z.object({
    body: z.object({
        title: z
            .string({ required_error: 'Заглавието е задължително' })
            .min(1, 'Заглавието е задължително'),
        description: z
            .string({ required_error: 'Описанието е задължително' })
            .min(1, 'Описанието е задължително'),
        contactEmail: z
            .string({ required_error: 'Имейлът за контакт е задължителен' })
            .email('Невалиден имейл формат'),
        requirements: z.string().optional().nullable(),
        applicationDeadline: z.string().datetime('INVALID_DATE').optional().nullable(),
        isActive: z.boolean().optional(),
        status: z.enum(['DRAFT', 'PUBLISHED']).optional(),
    }),
});

export const updateJob = z.object({
    params: z.object({
        id: z.string().transform(Number).pipe(z.number().int().positive()),
    }),
    body: z.object({
        title: z.string().min(1).optional(),
        description: z.string().min(1).optional(),
        contactEmail: z.string().email('Невалиден имейл формат').optional(),
        requirements: z.string().optional().nullable(),
        applicationDeadline: z.string().datetime('INVALID_DATE').optional().nullable(),
        isActive: z.boolean().optional(),
        status: z.enum(['DRAFT', 'PUBLISHED']).optional(),
    }),
});

export const getJobById = z.object({
    params: z.object({
        id: z.string().transform(Number).pipe(z.number().int().positive()),
    }),
});

export const getJobList = z.object({
    query: z.object({
        status: z.enum(['DRAFT', 'PUBLISHED']).optional(),
        isActive: z.enum(['true', 'false']).optional(),
    }),
});

export type CreateJobType = z.infer<typeof createJob>;
export type UpdateJobType = z.infer<typeof updateJob>;
export type GetJobByIdType = z.infer<typeof getJobById>;
export type GetJobListType = z.infer<typeof getJobList>;

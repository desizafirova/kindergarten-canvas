import { z } from 'zod';

export const createTeacher = z.object({
    body: z.object({
        firstName: z
            .string({
                required_error: 'Името е задължително',
            })
            .min(1, 'Името е задължително'),
        lastName: z
            .string({
                required_error: 'Фамилията е задължителна',
            })
            .min(1, 'Фамилията е задължителна'),
        position: z
            .string({
                required_error: 'Длъжността е задължителна',
            })
            .min(1, 'Длъжността е задължителна'),
        bio: z.string().optional().nullable(),
        photoUrl: z.string().url().optional().nullable(),
        status: z.enum(['DRAFT', 'PUBLISHED']).optional(),
        displayOrder: z.number().optional().nullable(),
    }),
});

export const updateTeacher = z.object({
    params: z.object({
        id: z.string().transform(Number), // Convert string param to number
    }),
    body: z.object({
        firstName: z.string().min(1).optional(),
        lastName: z.string().min(1).optional(),
        position: z.string().min(1).optional(),
        bio: z.string().optional().nullable(),
        photoUrl: z.string().url().optional().nullable(),
        status: z.enum(['DRAFT', 'PUBLISHED']).optional(),
        displayOrder: z.number().optional().nullable(),
    }),
});

export const getTeacherById = z.object({
    params: z.object({
        id: z.string().transform(Number),
    }),
});

export const getTeacherList = z.object({
    query: z.object({
        status: z.enum(['DRAFT', 'PUBLISHED']).optional(),
    }),
});

export type CreateTeacherType = z.infer<typeof createTeacher>;
export type UpdateTeacherType = z.infer<typeof updateTeacher>;
export type GetTeacherByIdType = z.infer<typeof getTeacherById>;
export type GetTeacherListType = z.infer<typeof getTeacherList>;

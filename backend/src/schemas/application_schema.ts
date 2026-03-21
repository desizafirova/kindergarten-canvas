import { z } from 'zod';

export const submitApplication = z.object({
    body: z.object({
        name: z
            .string({ required_error: 'Името е задължително' })
            .min(1, 'Името е задължително'),
        email: z
            .string({ required_error: 'Имейлът е задължителен' })
            .email('Невалиден имейл формат'),
        phone: z
            .string({ required_error: 'Телефонът е задължителен' })
            .regex(/^(\+359|0)(\s?[0-9]){8,9}$/, 'Невалиден телефонен номер'),
        coverLetter: z.string().optional(),
        jobId: z
            .string({ required_error: 'Позицията е задължителна' })
            .transform(Number)
            .pipe(z.number().int().positive()),
    }),
});

export type SubmitApplicationType = z.infer<typeof submitApplication>;

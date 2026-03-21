import { z } from 'zod';

export const applicationFormSchema = z.object({
  name: z.string().min(1, 'Името е задължително'),
  email: z
    .string()
    .min(1, 'Имейлът е задължителен')
    .email('Невалиден имейл формат'),
  phone: z
    .string()
    .min(1, 'Телефонът е задължителен')
    .regex(/^(\+359|0)(\s?[0-9]){8,9}$/, 'Невалиден телефонен номер'),
  coverLetter: z.string().optional(),
  cv: z
    .instanceof(File, { message: 'CV файлът е задължителен' })
    .refine(
      (file) => file.type === 'application/pdf',
      'Моля, качете PDF файл',
    )
    .refine(
      (file) => file.size <= 10 * 1024 * 1024,
      'Файлът е твърде голям. Максимален размер: 10MB',
    ),
});

export type ApplicationFormData = z.infer<typeof applicationFormSchema>;

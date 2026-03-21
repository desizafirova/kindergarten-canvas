import { z } from 'zod';

export const jobFormSchema = z.object({
  title: z
    .string()
    .min(1, 'Заглавието е задължително')
    .max(200, 'Заглавието е твърде дълго (максимум 200 символа)'),
  description: z
    .string()
    .min(1, 'Описанието е задължително'),
  requirements: z.string().nullable().optional(),
  contactEmail: z
    .string()
    .min(1, 'Имейлът за контакт е задължителен')
    .email('Невалиден имейл формат'),
  applicationDeadline: z.string().nullable().optional(),
  isActive: z.boolean().default(true),
  status: z.enum(['DRAFT', 'PUBLISHED']).default('DRAFT'),
});

export type JobFormData = z.infer<typeof jobFormSchema>;

import { z } from 'zod';

export const deadlineFormSchema = z.object({
  title: z
    .string()
    .min(1, 'Заглавието е задължително')
    .max(200, 'Заглавието е твърде дълго (максимум 200 символа)'),
  deadlineDate: z
    .string({ required_error: 'Крайната дата е задължителна' })
    .min(1, 'Крайната дата е задължителна'),
  description: z.string().nullable().optional(),
  isUrgent: z.boolean().default(false),
  status: z.enum(['DRAFT', 'PUBLISHED']).default('DRAFT'),
});

export type DeadlineFormData = z.infer<typeof deadlineFormSchema>;

import { z } from 'zod';

export const newsFormSchema = z.object({
  title: z
    .string()
    .min(1, 'Заглавието е задължително')
    .max(200, 'Заглавието е твърде дълго (максимум 200 символа)'),
  content: z.string().min(1, 'Съдържанието е задължително'),
  imageUrl: z.string().url().nullable(),
  status: z.enum(['DRAFT', 'PUBLISHED']).default('DRAFT'),
});

export type NewsFormData = z.infer<typeof newsFormSchema>;

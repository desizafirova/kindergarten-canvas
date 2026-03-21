import { z } from 'zod';

// Note: validation messages here must stay in sync with bg.ts galleryForm.errors translations
export const galleryFormSchema = z.object({
  title: z
    .string()
    .min(1, 'Заглавието е задължително') // mirrors galleryForm.errors.titleRequired
    .max(200, 'Заглавието е твърде дълго (максимум 200 символа)'),
  description: z.string().nullable().optional(),
  status: z.enum(['DRAFT', 'PUBLISHED']).default('DRAFT'),
});

export type GalleryFormData = z.infer<typeof galleryFormSchema>;

import { z } from 'zod';

export const eventFormSchema = z.object({
  title: z
    .string()
    .min(1, 'Заглавието е задължително')
    .max(200, 'Заглавието е твърде дълго (максимум 200 символа)'),
  eventDate: z
    .string({ required_error: 'Датата на събитието е задължителна' })
    .min(1, 'Датата на събитието е задължителна'),
  eventEndDate: z.string().nullable().optional(),
  location: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
  isImportant: z.boolean().default(false),
  imageUrl: z.preprocess(
    (val) => (val === '' ? null : val),
    z.string().url().refine(
      (url) => url.startsWith('https://res.cloudinary.com/'),
      'Невалиден URL на изображение - трябва да е от Cloudinary'
    ).nullable().optional()
  ),
  status: z.enum(['DRAFT', 'PUBLISHED']).default('DRAFT'),
}).superRefine((data, ctx) => {
  if (data.eventDate && data.eventEndDate) {
    const start = new Date(data.eventDate);
    const end = new Date(data.eventEndDate);
    if (end <= start) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Крайната дата трябва да е след началната',
        path: ['eventEndDate'],
      });
    }
  }
});

export type EventFormData = z.infer<typeof eventFormSchema>;

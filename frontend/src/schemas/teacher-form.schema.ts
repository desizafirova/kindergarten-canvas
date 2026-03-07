import { z } from 'zod';

export const teacherFormSchema = z.object({
  firstName: z
    .string()
    .min(1, 'Името е задължително')
    .max(100, 'Името е твърде дълго (максимум 100 символа)'),
  lastName: z
    .string()
    .min(1, 'Фамилията е задължителна')
    .max(100, 'Фамилията е твърде дълга (максимум 100 символа)'),
  position: z
    .string()
    .min(1, 'Длъжността е задължителна')
    .max(100, 'Длъжността е твърде дълга (максимум 100 символа)'),
  bio: z.string().nullable().optional(),
  photoUrl: z.preprocess(
    (val) => (val === '' ? null : val),
    z.string().url().refine(
      (url) => url.startsWith('https://res.cloudinary.com/'),
      'Невалиден URL на изображение - трябва да е от Cloudinary'
    ).nullable().optional()
  ),
  status: z.enum(['DRAFT', 'PUBLISHED']).default('DRAFT'),
});

export type TeacherFormData = z.infer<typeof teacherFormSchema>;

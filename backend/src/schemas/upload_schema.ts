import { z } from 'zod';

// Note: Multer handles file validation via fileFilter
// This schema is primarily for type safety and request structure validation
export const uploadFile = z.object({
  file: z.any().optional(), // Multer populates req.file, not body
});

export type UploadFileType = z.infer<typeof uploadFile>;

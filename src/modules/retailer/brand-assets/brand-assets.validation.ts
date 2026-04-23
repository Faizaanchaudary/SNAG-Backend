import { z } from 'zod';

export const brandAssetsFilterSchema = z.object({
  page:   z.coerce.number().min(1).default(1),
  limit:  z.coerce.number().min(1).max(100).default(20),
  search: z.string().optional(),
});

// File upload validation will be handled by multer middleware
export const uploadLogoSchema = z.object({
  // File validation will be done in middleware
  // This schema is for any additional data that might come with the upload
});

export type BrandAssetsFilterDto = z.infer<typeof brandAssetsFilterSchema>;
export type UploadLogoDto = z.infer<typeof uploadLogoSchema>;
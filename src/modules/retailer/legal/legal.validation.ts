import { z } from 'zod';

export const createDocSchema = z.object({
  title:   z.string().min(2, 'Title must be at least 2 characters').max(200).trim(),
  type:    z.enum(['terms', 'privacy', 'dpa', 'other']).default('other'),
  content: z.string().max(10000).optional(),
  version: z.string().min(1, 'Version is required').max(50).trim(),
});

export const updateDocSchema = createDocSchema.partial();

export const docsFilterSchema = z.object({
  page:  z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
});

export type CreateDocDto  = z.infer<typeof createDocSchema>;
export type UpdateDocDto  = z.infer<typeof updateDocSchema>;
export type DocsFilterDto = z.infer<typeof docsFilterSchema>;
import { z } from 'zod';

export const TEMPLATE_TYPES = {
  PERCENT_OFF: 'percent_off',
  BOGO:        'bogo',
  FREE_GIFT:   'free_gift',
  CUSTOM:      'custom',
} as const;

export const createTemplateSchema = z.object({
  name:        z.string().min(2, 'Name must be at least 2 characters').max(100).trim(),
  description: z.string().max(500).trim().optional(),
  type:        z.enum(['percent_off', 'bogo', 'free_gift', 'custom']),
});

export const updateTemplateSchema = createTemplateSchema.partial();

export const templatesFilterSchema = z.object({
  page:   z.coerce.number().min(1).default(1),
  limit:  z.coerce.number().min(1).max(100).default(20),
  search: z.string().optional(),
  type:   z.enum(['percent_off', 'bogo', 'free_gift', 'custom']).optional(),
});

export type CreateTemplateDto  = z.infer<typeof createTemplateSchema>;
export type UpdateTemplateDto  = z.infer<typeof updateTemplateSchema>;
export type TemplatesFilterDto = z.infer<typeof templatesFilterSchema>;
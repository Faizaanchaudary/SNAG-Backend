import { z } from 'zod';

const filtersSchema = z.object({
  minAge:        z.coerce.number().int().min(0).max(120).optional(),
  maxAge:        z.coerce.number().int().min(0).max(120).optional(),
  gender:        z.enum(['male', 'female', 'other', '']).optional(),
  interests:     z.union([
    z.array(z.string()),
    z.string().transform((s) => s ? s.split(',').map(i => i.trim()).filter(Boolean) : []),
  ]).optional(),
  maxDistanceKm: z.coerce.number().min(0).optional(),
  behaviorTags:  z.union([
    z.array(z.string()),
    z.string().transform((s) => s ? s.split(',').map(t => t.trim()).filter(Boolean) : []),
  ]).optional(),
}).optional();

export const createSegmentSchema = z.object({
  name:        z.string().min(2, 'Name must be at least 2 characters').max(100).trim(),
  description: z.string().max(500).trim().optional(),
  filters:     filtersSchema,
});

export const updateSegmentSchema = createSegmentSchema.partial();

export const segmentsFilterSchema = z.object({
  page:   z.coerce.number().min(1).default(1),
  limit:  z.coerce.number().min(1).max(100).default(20),
  search: z.string().optional(),
});

export type CreateSegmentDto  = z.infer<typeof createSegmentSchema>;
export type UpdateSegmentDto  = z.infer<typeof updateSegmentSchema>;
export type SegmentsFilterDto = z.infer<typeof segmentsFilterSchema>;
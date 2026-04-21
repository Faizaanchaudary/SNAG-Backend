import { z } from 'zod';

export const redemptionsFilterSchema = z.object({
  q: z.string().optional(),
  offerId: z.string().optional(),
  merchantId: z.string().optional(),
  clientId: z.string().optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
});

export type RedemptionsFilterDto = z.infer<typeof redemptionsFilterSchema>;
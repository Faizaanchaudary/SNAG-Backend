import { z } from 'zod';

export const dashboardQuerySchema = z.object({
  limit: z.coerce.number().min(1).max(100).default(10),
});

export const topOffersQuerySchema = z.object({
  limit: z.coerce.number().min(1).max(50).default(5),
});

export const activityQuerySchema = z.object({
  limit: z.coerce.number().min(1).max(100).default(10),
});

export type DashboardQueryDto = z.infer<typeof dashboardQuerySchema>;
export type TopOffersQueryDto = z.infer<typeof topOffersQuerySchema>;
export type ActivityQueryDto = z.infer<typeof activityQuerySchema>;
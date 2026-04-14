import { z } from 'zod';

export const notificationFilterSchema = z.object({
  type: z.enum(['offer', 'redemption', 'system', 'all']).optional(),
  read: z.coerce.boolean().optional(),
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
});

export const notificationIdSchema = z.object({
  id: z.string().min(1),
});

export const markReadSchema = z.object({
  read: z.boolean(),
});

export type NotificationFilterDto = z.infer<typeof notificationFilterSchema>;
export type NotificationIdDto = z.infer<typeof notificationIdSchema>;
export type MarkReadDto = z.infer<typeof markReadSchema>;

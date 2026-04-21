import { z } from 'zod';
import { USER_ROLES } from '@common/constants.js';

export const createInviteSchema = z.object({
  email: z.string().email().toLowerCase().trim(),
  role: z.enum([USER_ROLES.ADMIN, USER_ROLES.MERCHANT]),
  message: z.string().max(500).trim().optional(),
});

export const updateInviteSchema = z.object({
  status: z.enum(['pending', 'accepted', 'expired', 'cancelled']).optional(),
});

export type CreateInviteDto = z.infer<typeof createInviteSchema>;
export type UpdateInviteDto = z.infer<typeof updateInviteSchema>;
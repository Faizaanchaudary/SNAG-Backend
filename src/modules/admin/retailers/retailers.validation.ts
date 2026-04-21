import { z } from 'zod';
import { USER_ROLES } from '@common/constants.js';

export const createRetailerSchema = z.object({
  firstName: z.string().min(2).max(50).trim(),
  lastName: z.string().min(2).max(50).trim(),
  email: z.string().email().toLowerCase().trim(),
  phoneNumber: z.string().min(5).max(20).trim().optional(),
  password: z.string().min(8).max(64).optional(), // Optional, will generate if not provided
});

export const updateRetailerSchema = z.object({
  firstName: z.string().min(2).max(50).trim().optional(),
  lastName: z.string().min(2).max(50).trim().optional(),
  email: z.string().email().toLowerCase().trim().optional(),
  phoneNumber: z.string().min(5).max(20).trim().optional(),
  isVerified: z.boolean().optional(),
  onboardingStep: z.number().min(1).max(6).optional(),
});

export type CreateRetailerDto = z.infer<typeof createRetailerSchema>;
export type UpdateRetailerDto = z.infer<typeof updateRetailerSchema>;
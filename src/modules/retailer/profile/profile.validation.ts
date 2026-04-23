import { z } from 'zod';

export const updateProfileSchema = z.object({
  firstName:   z.string().min(2, 'First name must be at least 2 characters').max(50).trim().optional(),
  lastName:    z.string().min(2, 'Last name must be at least 2 characters').max(50).trim().optional(),
  phoneNumber: z.string().min(5, 'Phone number must be at least 5 characters').max(20).trim().optional(),
});

export type UpdateProfileDto = z.infer<typeof updateProfileSchema>;

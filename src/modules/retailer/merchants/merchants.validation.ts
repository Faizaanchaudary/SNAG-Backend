import { z } from 'zod';

export const createMerchantSchema = z.object({
  firstName:   z.string().min(2, 'First name must be at least 2 characters').max(50).trim(),
  lastName:    z.string().min(2, 'Last name must be at least 2 characters').max(50).trim(),
  email:       z.string().email('Invalid email format').toLowerCase().trim(),
  password:    z.string().min(8, 'Password must be at least 8 characters').max(64),
  phoneNumber: z.string().min(5, 'Phone number must be at least 5 characters').max(20).trim().optional(),
});

export const updateMerchantSchema = z.object({
  firstName:   z.string().min(2, 'First name must be at least 2 characters').max(50).trim().optional(),
  lastName:    z.string().min(2, 'Last name must be at least 2 characters').max(50).trim().optional(),
  phoneNumber: z.string().min(5, 'Phone number must be at least 5 characters').max(20).trim().optional(),
  isVerified:  z.boolean().optional(),
});

export const merchantsFilterSchema = z.object({
  page:   z.coerce.number().min(1).default(1),
  limit:  z.coerce.number().min(1).max(100).default(20),
  search: z.string().optional(),
  status: z.enum(['active', 'inactive']).optional(),
});

export type CreateMerchantDto = z.infer<typeof createMerchantSchema>;
export type UpdateMerchantDto = z.infer<typeof updateMerchantSchema>;
export type MerchantsFilterDto = z.infer<typeof merchantsFilterSchema>;
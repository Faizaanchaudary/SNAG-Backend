import { z } from 'zod';

export const createBranchSchema = z.object({
  merchantId:     z.string().min(1, 'Merchant ID is required'),
  branchName:     z.string().min(2, 'Branch name must be at least 2 characters').max(100).trim(),
  branchAddress:  z.string().min(5, 'Branch address must be at least 5 characters').max(200).trim(),
  industry:       z.string().min(2, 'Industry is required').max(50).trim(),
  subCategories:  z.array(z.string()).default([]),
  phoneNumber:    z.string().min(5, 'Phone number must be at least 5 characters').max(20).trim(),
});

export const updateBranchSchema = z.object({
  branchName:     z.string().min(2).max(100).trim().optional(),
  branchAddress:  z.string().min(5).max(200).trim().optional(),
  industry:       z.string().min(2).max(50).trim().optional(),
  subCategories:  z.array(z.string()).optional(),
  phoneNumber:    z.string().min(5).max(20).trim().optional(),
  role:           z.string().max(50).optional(),
});

export const branchesFilterSchema = z.object({
  page:       z.coerce.number().min(1).default(1),
  limit:      z.coerce.number().min(1).max(100).default(20),
  search:     z.string().optional(),
  merchantId: z.string().optional(),
});

export type CreateBranchDto = z.infer<typeof createBranchSchema>;
export type UpdateBranchDto = z.infer<typeof updateBranchSchema>;
export type BranchesFilterDto = z.infer<typeof branchesFilterSchema>;
import { z } from 'zod';

export const merchantRegisterSchema = z.object({
  firstName:   z.string().min(2).max(50).trim(),
  lastName:    z.string().min(2).max(50).trim(),
  email:       z.string().email().toLowerCase().trim(),
  phoneNumber: z.string().min(5).max(20).trim(),
  password:    z.string().min(8).max(64),
});

export const clientRegisterSchema = z.object({
  userName:    z.string().min(2).max(50).trim(),
  email:       z.string().email().toLowerCase().trim(),
  phoneNumber: z.string().min(5).max(20).trim(),
  password:    z.string().min(8).max(64),
});

export const verifyEmailSchema = z.object({
  email: z.string().email().toLowerCase().trim(),
  code:  z.string().length(5),
});

export const resendCodeSchema = z.object({
  email: z.string().email().toLowerCase().trim(),
});

export const loginSchema = z.object({
  email:    z.string().email().toLowerCase().trim(),
  password: z.string().min(1),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email().toLowerCase().trim(),
});

export const resetPasswordSchema = z.object({
  email:           z.string().email().toLowerCase().trim(),
  code:            z.string().length(5),
  newPassword:     z.string().min(8).max(64),
  confirmPassword: z.string().min(8).max(64),
}).refine((d) => d.newPassword === d.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword:     z.string().min(8).max(64),
  confirmPassword: z.string().min(8).max(64),
}).refine((d) => d.newPassword === d.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

export const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1),
});

export type MerchantRegisterDto  = z.infer<typeof merchantRegisterSchema>;
export type ClientRegisterDto    = z.infer<typeof clientRegisterSchema>;
export type VerifyEmailDto       = z.infer<typeof verifyEmailSchema>;
export type ResendCodeDto        = z.infer<typeof resendCodeSchema>;
export type LoginDto             = z.infer<typeof loginSchema>;
export type ForgotPasswordDto    = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordDto     = z.infer<typeof resetPasswordSchema>;
export type ChangePasswordDto    = z.infer<typeof changePasswordSchema>;
export type RefreshTokenDto      = z.infer<typeof refreshTokenSchema>;

import * as authRepository from './auth.repository.js';
import { hashPassword, comparePassword } from '@core/auth/password.js';
import { signAccessToken, signRefreshToken } from '@core/auth/jwt.js';
import { generateOtp } from '@common/utils/otp.js';
import { otpEmailTemplate, passwordResetEmailTemplate } from '@common/utils/email-templates.js';
import { sendMail } from '@config/mailer.js';
import {
  USER_ROLES,
  MERCHANT_ONBOARDING_STEPS,
  CLIENT_ONBOARDING_STEPS,
  OTP_EXPIRY_MINUTES,
  OTP_RESEND_COOLDOWN_SECONDS,
} from '@common/constants.js';
import {
  ConflictError,
  AuthError,
  ValidationError,
  NotFoundError,
} from '@core/errors/app-error.js';
import { toUserResponse } from '@common/mappers/user.mapper.js';
import { User } from '@models/user.model.js';
import { createNotification } from '@modules/notifications/notifications.service.js';
import type {
  MerchantRegisterDto,
  ClientRegisterDto,
  VerifyEmailDto,
  ResendCodeDto,
  LoginDto,
  ForgotPasswordDto,
  ResetPasswordDto,
  ChangePasswordDto,
} from './auth.validation.js';

// ── Helpers ──────────────────────────────────────────────────────────────────

const issueTokens = async (id: string, role: string) => {
  const accessToken = signAccessToken({ id, role: role as never });
  const refreshToken = signRefreshToken({ id, role: role as never });
  
  // Store refresh token in database with 7-day expiry
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  await authRepository.saveRefreshToken(id, refreshToken, expiresAt);
  
  return { accessToken, refreshToken };
};

const sendOtp = async (email: string): Promise<void> => {
  const code      = generateOtp();
  const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);

  await authRepository.upsertOtp(email, code, expiresAt);
  await sendMail(email, 'Your SNAG verification code', otpEmailTemplate(code, OTP_EXPIRY_MINUTES));
};

const sendPasswordResetOtp = async (email: string): Promise<void> => {
  const code      = generateOtp();
  const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);

  await authRepository.upsertOtp(email, code, expiresAt);
  await sendMail(email, 'Reset your SNAG password', passwordResetEmailTemplate(code, OTP_EXPIRY_MINUTES));
};

// ── Merchant Auth ─────────────────────────────────────────────────────────────

export const merchantRegister = async (dto: MerchantRegisterDto) => {
  const existing = await authRepository.findUserByEmail(dto.email);
  if (existing) throw new ConflictError('Email already in use');

  const hashed = await hashPassword(dto.password);

  const newUser = await authRepository.createUser({
    firstName:   dto.firstName,
    lastName:    dto.lastName,
    email:       dto.email,
    phoneNumber: dto.phoneNumber,
    password:    hashed,
    role:        USER_ROLES.MERCHANT,
  });

  await sendOtp(dto.email);

  // Notify all retailers about the new merchant account (non-blocking)
  User.find({ role: USER_ROLES.RETAILER, isDeleted: false }).select('_id').lean()
    .then((retailers) => {
      const promises = retailers.map((r) =>
        createNotification({
          userId:   r._id.toString(),
          userType: 'retailer',
          type:     'merchant_action',
          title:    'New Merchant Registered',
          message:  `${dto.firstName} ${dto.lastName} (${dto.email}) just created a merchant account.`,
          metadata: { merchantId: (newUser as any)._id?.toString(), action: 'registered' },
        }).catch(() => {}),
      );
      return Promise.all(promises);
    })
    .catch(() => {});

  return { message: 'Verification code sent to your email' };
};

// ── Client Auth ───────────────────────────────────────────────────────────────

export const clientRegister = async (dto: ClientRegisterDto) => {
  const existing = await authRepository.findUserByEmail(dto.email);
  if (existing) throw new ConflictError('Email already in use');

  const hashed = await hashPassword(dto.password);

  await authRepository.createUser({
    firstName:   dto.userName, // stored in firstName for shared model
    lastName:    '',
    email:       dto.email,
    password:    hashed,
    role:        USER_ROLES.CLIENT,
    userName:    dto.userName,
    phoneNumber: dto.phoneNumber,
  });

  await sendOtp(dto.email);
  return { message: 'Verification code sent to your email' };
};

// ── Shared ────────────────────────────────────────────────────────────────────

export const verifyEmail = async (dto: VerifyEmailDto) => {
  const user = await authRepository.findUserByEmail(dto.email);
  if (!user) throw new AuthError('Account not found');
  if (user.isVerified) throw new ValidationError('Email already verified');

  const otp = await authRepository.findValidOtp(dto.email, dto.code);
  if (!otp) throw new ValidationError('Invalid or expired code');

  await authRepository.markOtpUsed(otp.id as string);

  // Step 2 is EMAIL_VERIFIED for both roles
  const step = user.role === USER_ROLES.MERCHANT
    ? MERCHANT_ONBOARDING_STEPS.EMAIL_VERIFIED
    : CLIENT_ONBOARDING_STEPS.EMAIL_VERIFIED;

  const updated = await authRepository.markEmailVerified(user.id as string, step);
  const tokens  = await issueTokens(user.id as string, user.role);

  return { ...tokens, user: toUserResponse(updated!) };
};

export const resendCode = async (dto: ResendCodeDto) => {
  const user = await authRepository.findUserByEmail(dto.email);
  if (!user) throw new AuthError('Account not found');
  if (user.isVerified) throw new ValidationError('Email already verified');

  // Enforce resend cooldown
  const latest = await authRepository.findLatestOtp(dto.email);
  if (latest) {
    const secondsSinceLast = (Date.now() - latest.lastSentAt.getTime()) / 1000;
    if (secondsSinceLast < OTP_RESEND_COOLDOWN_SECONDS) {
      const wait = Math.ceil(OTP_RESEND_COOLDOWN_SECONDS - secondsSinceLast);
      throw new ValidationError(`Please wait ${wait} seconds before requesting a new code`);
    }
  }

  await sendOtp(dto.email);
  return { message: 'Verification code resent' };
};

export const login = async (dto: LoginDto) => {
  const user = await authRepository.findUserByEmailWithPassword(dto.email);
  if (!user) throw new AuthError('Invalid email or password');

  const valid = await comparePassword(dto.password, user.password);
  if (!valid) throw new AuthError('Invalid email or password');

  if (!user.isVerified) throw new AuthError('Please verify your email first');

  const tokens = await issueTokens(user.id as string, user.role);

  return {
    ...tokens,
    user: toUserResponse(user),
  };
};

// ── Password Reset (unauthenticated) ─────────────────────────────────────────

export const forgotPassword = async (dto: ForgotPasswordDto) => {
  const user = await authRepository.findUserByEmail(dto.email);
  // Always return the same message to prevent email enumeration
  if (!user || !user.isVerified) {
    return { message: 'If that email exists, a reset code has been sent' };
  }

  // Enforce resend cooldown (reuse same OTP collection)
  const latest = await authRepository.findLatestOtp(dto.email);
  if (latest) {
    const secondsSinceLast = (Date.now() - latest.lastSentAt.getTime()) / 1000;
    if (secondsSinceLast < OTP_RESEND_COOLDOWN_SECONDS) {
      const wait = Math.ceil(OTP_RESEND_COOLDOWN_SECONDS - secondsSinceLast);
      throw new ValidationError(`Please wait ${wait} seconds before requesting a new code`);
    }
  }

  await sendPasswordResetOtp(dto.email);
  return { message: 'If that email exists, a reset code has been sent' };
};

export const resetPassword = async (dto: ResetPasswordDto) => {
  const user = await authRepository.findUserByEmail(dto.email);
  if (!user) throw new NotFoundError('Account not found');

  const otp = await authRepository.findValidOtp(dto.email, dto.code);
  if (!otp) throw new ValidationError('Invalid or expired code');

  await authRepository.markOtpUsed(otp.id as string);

  const hashed = await hashPassword(dto.newPassword);
  await authRepository.updatePassword(user.id as string, hashed);

  return { message: 'Password reset successful. You can now log in.' };
};

// ── Change Password (authenticated) ──────────────────────────────────────────

export const changePassword = async (userId: string, dto: ChangePasswordDto) => {
  const user = await authRepository.findUserByEmailWithPassword(
    (await authRepository.findUserById(userId))?.email ?? '',
  );
  if (!user) throw new NotFoundError('Account not found');

  const valid = await comparePassword(dto.currentPassword, user.password);
  if (!valid) throw new AuthError('Current password is incorrect');

  const hashed = await hashPassword(dto.newPassword);
  await authRepository.updatePassword(user.id as string, hashed);

  return { message: 'Password changed successfully' };
};

// ── Get Current User ──────────────────────────────────────────────────────────

export const getCurrentUser = async (userId: string) => {
  const user = await authRepository.findUserById(userId);
  if (!user) throw new NotFoundError('User not found');
  return toUserResponse(user);
};

// ── Logout ────────────────────────────────────────────────────────────────────

export const logout = async (userId: string, refreshToken?: string) => {
  // IMPORTANT: Only delete token if explicitly provided
  // Never delete all tokens as fallback - that would log out all user devices
  if (refreshToken) {
    await authRepository.deleteRefreshToken(refreshToken);
  }
  // If no token provided, just return success (client-side logout)
  
  return { message: 'Logged out successfully' };
};

// ── Logout from all devices ───────────────────────────────────────────────────

export const logoutAllDevices = async (userId: string) => {
  // Explicitly delete all refresh tokens for this user
  await authRepository.deleteAllUserRefreshTokens(userId);
  
  return { message: 'Logged out from all devices successfully' };
};

// ── Refresh Token ─────────────────────────────────────────────────────────────

export const refreshAccessToken = async (refreshToken: string) => {
  // Find user with this refresh token
  const user = await authRepository.findRefreshToken(refreshToken);
  if (!user) throw new AuthError('Invalid or expired refresh token');
  if (user.isDeleted) throw new AuthError('Account has been deleted');

  // Issue new access token (keep same refresh token)
  const accessToken = signAccessToken({ 
    id: user.id as string, 
    role: user.role as never 
  });

  return { accessToken };
};

// ── Delete Account ────────────────────────────────────────────────────────────

export const deleteAccount = async (userId: string) => {
  await authRepository.softDeleteUser(userId);
  return { message: 'Account deleted successfully' };
};

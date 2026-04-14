import { User, UserDocument } from '@models/user.model.js';
import { Otp, OtpDocument } from '@models/otp.model.js';
import { UserRole } from '@common/constants.js';

// ── User ────────────────────────────────────────────────────────────────────

export const findUserByEmail = (email: string): Promise<UserDocument | null> =>
  User.findOne({ email }).exec();

export const findUserById = (id: string): Promise<UserDocument | null> =>
  User.findById(id).exec();

export const findUserByEmailWithPassword = (email: string): Promise<UserDocument | null> =>
  User.findOne({ email }).select('+password').exec();

export const createUser = (data: {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: UserRole;
  userName?: string;
  phoneNumber?: string;
}): Promise<UserDocument> => new User(data).save();

export const markEmailVerified = (userId: string, step: number): Promise<UserDocument | null> =>
  User.findByIdAndUpdate(userId, { isVerified: true, onboardingStep: step }, { new: true }).exec();

export const updatePassword = (userId: string, hashedPassword: string): Promise<UserDocument | null> =>
  User.findByIdAndUpdate(userId, { password: hashedPassword }, { new: true }).exec();

// ── OTP ─────────────────────────────────────────────────────────────────────

export const upsertOtp = (email: string, code: string, expiresAt: Date): Promise<OtpDocument> =>
  Otp.findOneAndUpdate(
    { email },
    { code, expiresAt, used: false, lastSentAt: new Date() },
    { upsert: true, new: true },
  ).exec() as Promise<OtpDocument>;

export const findValidOtp = (email: string, code: string): Promise<OtpDocument | null> =>
  Otp.findOne({ email, code, used: false, expiresAt: { $gt: new Date() } }).exec();

export const markOtpUsed = (otpId: string): Promise<OtpDocument | null> =>
  Otp.findByIdAndUpdate(otpId, { used: true }, { new: true }).exec();

export const findLatestOtp = (email: string): Promise<OtpDocument | null> =>
  Otp.findOne({ email }).sort({ lastSentAt: -1 }).exec();

export const softDeleteUser = (userId: string): Promise<UserDocument | null> =>
  User.findByIdAndUpdate(userId, { isDeleted: true }, { new: true }).exec();

// ── Refresh Tokens (stored in User model) ──────────────────────────────────────

export const saveRefreshToken = async (
  userId: string,
  token: string,
  expiresAt: Date
): Promise<UserDocument | null> =>
  User.findByIdAndUpdate(
    userId,
    {
      $push: {
        refreshTokens: {
          token,
          expiresAt,
          createdAt: new Date(),
        },
      },
    },
    { new: true }
  ).exec();

export const findRefreshToken = async (token: string): Promise<UserDocument | null> =>
  User.findOne({
    'refreshTokens.token': token,
    'refreshTokens.expiresAt': { $gt: new Date() },
  }).exec();

export const deleteRefreshToken = async (token: string): Promise<void> => {
  await User.updateOne(
    { 'refreshTokens.token': token },
    { $pull: { refreshTokens: { token } } }
  ).exec();
};

export const deleteAllUserRefreshTokens = async (userId: string): Promise<void> => {
  await User.findByIdAndUpdate(userId, { refreshTokens: [] }).exec();
};

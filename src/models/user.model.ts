import mongoose, { Document, Schema } from 'mongoose';
import { USER_ROLES, UserRole } from '@common/constants.js';

export interface IUser {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: UserRole;
  isVerified: boolean;
  isDeleted: boolean;
  onboardingStep: number;
  // client-only fields
  userName?: string;
  phoneNumber?: string;
  interests?: string[];
  avatarUrl?: string;
  location?: {
    lat: number;
    lng: number;
  };
  // refresh tokens for session management
  refreshTokens?: Array<{
    token: string;
    expiresAt: Date;
    createdAt: Date;
  }>;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserDocument extends IUser, Document {}

const userSchema = new Schema<UserDocument>(
  {
    firstName:      { type: String, required: true, trim: true },
    lastName:       { type: String, required: false, trim: true, default: '' },
    email:          { type: String, required: true, unique: true, lowercase: true, trim: true },
    password:       { type: String, required: true, select: false },
    role:           { type: String, enum: Object.values(USER_ROLES), required: true },
    isVerified:     { type: Boolean, default: false },
    isDeleted:      { type: Boolean, default: false },
    onboardingStep: { type: Number, default: 1 },
    // client-only
    userName:    { type: String, trim: true },
    phoneNumber: { type: String, trim: true },
    interests:   { type: [String], default: [] },
    avatarUrl:   { type: String },
    location: {
      lat: { type: Number },
      lng: { type: Number },
    },
    refreshTokens: [
      {
        token: { type: String, required: true },
        expiresAt: { type: Date, required: true },
        createdAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true },
);

// Exclude deleted accounts from all queries by default
userSchema.pre(/^find/, function (this: mongoose.Query<unknown, UserDocument>, next) {
  this.where({ isDeleted: false });
  next();
});

// Clean up expired refresh tokens before saving
userSchema.pre('save', function (next) {
  if (this.refreshTokens && this.refreshTokens.length > 0) {
    this.refreshTokens = this.refreshTokens.filter(
      (token) => token.expiresAt > new Date()
    );
  }
  next();
});

export const User = mongoose.model<UserDocument>('User', userSchema);

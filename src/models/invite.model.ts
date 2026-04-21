import mongoose, { Document, Schema } from 'mongoose';
import { USER_ROLES, UserRole } from '@common/constants.js';

export interface IInvite {
  email: string;
  role: UserRole;
  status: 'pending' | 'accepted' | 'expired' | 'cancelled';
  invitedBy: mongoose.Types.ObjectId;
  message?: string;
  token: string;
  expiresAt: Date;
  acceptedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface InviteDocument extends IInvite, Document {}

const inviteSchema = new Schema<InviteDocument>(
  {
    email: { type: String, required: true, lowercase: true, trim: true },
    role: { type: String, enum: Object.values(USER_ROLES), required: true },
    status: { 
      type: String, 
      enum: ['pending', 'accepted', 'expired', 'cancelled'], 
      default: 'pending' 
    },
    invitedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    message: { type: String, trim: true },
    token: { type: String, required: true, unique: true },
    expiresAt: { type: Date, required: true },
    acceptedAt: { type: Date },
  },
  { timestamps: true }
);

inviteSchema.index({ email: 1, status: 1 });
inviteSchema.index({ expiresAt: 1 });

export const Invite = mongoose.model<InviteDocument>('Invite', inviteSchema);
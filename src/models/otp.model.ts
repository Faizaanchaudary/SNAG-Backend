import mongoose, { Document, Schema } from 'mongoose';

export interface IOtp {
  email: string;
  code: string;
  expiresAt: Date;
  used: boolean;
  lastSentAt: Date;
}

export interface OtpDocument extends IOtp, Document {}

const otpSchema = new Schema<OtpDocument>({
  email:      { type: String, required: true, lowercase: true, trim: true },
  code:       { type: String, required: true },
  expiresAt:  { type: Date, required: true },
  used:       { type: Boolean, default: false },
  lastSentAt: { type: Date, default: Date.now },
});

// Auto-delete expired OTPs from the collection
otpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
otpSchema.index({ email: 1 });

export const Otp = mongoose.model<OtpDocument>('Otp', otpSchema);

import mongoose, { Document, Schema } from 'mongoose';

export interface IBranchProfile {
  merchant: mongoose.Types.ObjectId;
  branchName: string;
  phoneNumber: string;
  branchAddress: string;
  logoUrl?: string;
  industry: string;
  subCategories: string[];
  role?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface BranchProfileDocument extends IBranchProfile, Document {}

const branchProfileSchema = new Schema<BranchProfileDocument>(
  {
    merchant:      { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    branchName:    { type: String, required: true, trim: true },
    phoneNumber:   { type: String, required: true, trim: true },
    branchAddress: { type: String, required: true, trim: true },
    logoUrl:       { type: String },
    industry:      { type: String, required: true },
    subCategories: { type: [String], default: [] },
    role:          { type: String },
  },
  { timestamps: true },
);

export const BranchProfile = mongoose.model<BranchProfileDocument>('BranchProfile', branchProfileSchema);

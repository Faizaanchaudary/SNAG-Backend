import mongoose, { Document, Schema } from 'mongoose';

export interface IPromotionRule {
  name:                  string;
  description?:          string;
  scope:                 'global' | 'retailer';
  retailerId?:           mongoose.Types.ObjectId;
  maxLiveOffersPerStore?: number;
  maxDurationDays?:      number;
  allowOpenEnded:        boolean;
  enabled:               boolean;
  createdBy:             mongoose.Types.ObjectId;
  isDeleted:             boolean;
  createdAt:             Date;
  updatedAt:             Date;
}

export interface PromotionRuleDocument extends IPromotionRule, Document {}

const promotionRuleSchema = new Schema<PromotionRuleDocument>(
  {
    name:                  { type: String, required: true, trim: true },
    description:           { type: String, trim: true },
    scope:                 { type: String, enum: ['global', 'retailer'], required: true, default: 'global' },
    retailerId:            { type: Schema.Types.ObjectId, ref: 'User' },
    maxLiveOffersPerStore: { type: Number, min: 0 },
    maxDurationDays:       { type: Number, min: 0 },
    allowOpenEnded:        { type: Boolean, default: false },
    enabled:               { type: Boolean, default: true },
    createdBy:             { type: Schema.Types.ObjectId, ref: 'User', required: true },
    isDeleted:             { type: Boolean, default: false },
  },
  { timestamps: true },
);

export const PromotionRule = mongoose.model<PromotionRuleDocument>('PromotionRule', promotionRuleSchema);
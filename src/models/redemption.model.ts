import mongoose, { Document, Schema } from 'mongoose';

export interface IRedemption {
  client:     mongoose.Types.ObjectId;
  offer:      mongoose.Types.ObjectId;
  merchant:   mongoose.Types.ObjectId;
  couponCode?: string;
  qrCodeUrl?:  string;
  barCodeUrl?: string;
  location?: {
    lat: number;
    lng: number;
    address?: string;
  };
  metadata?: Record<string, any>;
  redeemedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface RedemptionDocument extends IRedemption, Document {}

const redemptionSchema = new Schema<RedemptionDocument>(
  {
    client:    { type: Schema.Types.ObjectId, ref: 'User',  required: true },
    offer:     { type: Schema.Types.ObjectId, ref: 'Offer', required: true },
    merchant:  { type: Schema.Types.ObjectId, ref: 'User',  required: true },
    couponCode: { type: String },
    qrCodeUrl:  { type: String },
    barCodeUrl: { type: String },
    location: {
      lat: { type: Number },
      lng: { type: Number },
      address: { type: String },
    },
    metadata: { type: Schema.Types.Mixed },
    redeemedAt: { type: Date, default: Date.now },
  },
  { timestamps: true },
);

redemptionSchema.index({ client: 1, offer: 1 });
redemptionSchema.index({ client: 1, redeemedAt: -1 });
redemptionSchema.index({ merchant: 1 });

export const Redemption = mongoose.model<RedemptionDocument>('Redemption', redemptionSchema);

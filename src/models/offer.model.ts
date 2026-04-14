import mongoose, { Document, Schema } from 'mongoose';
import {
  OFFER_TYPES, OFFER_STATUSES, DISCOUNT_TYPES,
  OfferType, OfferStatus, DiscountType,
} from '@common/constants.js';

export interface IOffer {
  merchant: mongoose.Types.ObjectId;

  // ── Basic Info ──────────────────────────────────────────────────────────────
  title:              string;
  description:        string;
  bannerUrl?:         string;
  offerType:          OfferType;
  categories:         string[];
  status:             OfferStatus;
  termsAndConditions: string;

  // ── Scan Info ───────────────────────────────────────────────────────────────
  discountType?:    DiscountType;
  redemptionUrl?:   string;
  couponCode?:      string;
  qrCodeUrl?:       string;
  barCodeUrl?:      string;
  redemptionLimit?: number;

  // ── Location Info ───────────────────────────────────────────────────────────
  locationIds: mongoose.Types.ObjectId[];
  startDate?:  Date;
  endDate?:    Date;

  // ── Target Audience ─────────────────────────────────────────────────────────
  targetAudience: {
    demographics: string[];
    interests:    string[];
    behaviors:    string[];
    radiusKm?:    number;
  };

  // ── Stats (read-only, updated by system) ────────────────────────────────────
  stats: {
    views:       number;
    clicks:      number;
    redemptions: number;
  };

  isDeleted:  boolean;
  createdAt:  Date;
  updatedAt:  Date;
}

export interface OfferDocument extends IOffer, Document {}

const offerSchema = new Schema<OfferDocument>(
  {
    merchant:           { type: Schema.Types.ObjectId, ref: 'User', required: true },

    // Basic Info
    title:              { type: String, required: true, trim: true },
    description:        { type: String, required: true, trim: true },
    bannerUrl:          { type: String },
    offerType:          { type: String, enum: Object.values(OFFER_TYPES), required: true },
    categories:         { type: [String], default: [] },
    status:             { type: String, enum: Object.values(OFFER_STATUSES), default: OFFER_STATUSES.ACTIVE },
    termsAndConditions: { type: String, required: true, trim: true },

    // Scan Info
    discountType:    { type: String, enum: Object.values(DISCOUNT_TYPES) },
    redemptionUrl:   { type: String },
    couponCode:      { type: String, trim: true },
    qrCodeUrl:       { type: String },
    barCodeUrl:      { type: String },
    redemptionLimit: { type: Number },

    // Location Info
    locationIds: [{ type: Schema.Types.ObjectId, ref: 'Location' }],
    startDate:   { type: Date },
    endDate:     { type: Date },

    // Target Audience
    targetAudience: {
      demographics: { type: [String], default: [] },
      interests:    { type: [String], default: [] },
      behaviors:    { type: [String], default: [] },
      radiusKm:     { type: Number },
    },

    // Stats
    stats: {
      views:       { type: Number, default: 0 },
      clicks:      { type: Number, default: 0 },
      redemptions: { type: Number, default: 0 },
    },

    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true },
);

offerSchema.index({ merchant: 1, status: 1 });
offerSchema.index({ locationIds: 1 });

// Exclude deleted offers from all queries
offerSchema.pre(/^find/, function (this: mongoose.Query<unknown, OfferDocument>, next) {
  this.where({ isDeleted: false });
  next();
});

export const Offer = mongoose.model<OfferDocument>('Offer', offerSchema);

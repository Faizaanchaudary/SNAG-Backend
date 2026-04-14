import mongoose, { Document, Schema } from 'mongoose';

export const LOCATION_TYPES = {
  MAIN: 'main',
  FRANCHISE: 'franchise',
} as const;

export type LocationType = (typeof LOCATION_TYPES)[keyof typeof LOCATION_TYPES];

export interface IBranchInfo {
  phoneNumber: string;
  email: string;
  contactName: string;
}

export interface ILocation {
  merchant: mongoose.Types.ObjectId;
  address: string;
  state: string;
  country: string;
  branchAddress: string;
  locationType: LocationType;
  coordinates: {
    lat: number;
    lng: number;
  };
  branchInfo?: IBranchInfo;
  bannerUrl?: string;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface LocationDocument extends ILocation, Document {}

const locationSchema = new Schema<LocationDocument>(
  {
    merchant:      { type: Schema.Types.ObjectId, ref: 'User', required: true },
    address:       { type: String, required: true, trim: true },
    state:         { type: String, required: true, trim: true },
    country:       { type: String, required: true, trim: true },
    branchAddress: { type: String, required: true, trim: true },
    locationType:  { type: String, enum: Object.values(LOCATION_TYPES), required: true },
    coordinates: {
      lat: { type: Number, required: true },
      lng: { type: Number, required: true },
    },
    branchInfo: {
      phoneNumber: { type: String, trim: true },
      email:       { type: String, lowercase: true, trim: true },
      contactName: { type: String, trim: true },
    },
    bannerUrl: { type: String, trim: true },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true },
);

// Geo index for future proximity queries
locationSchema.index({ 'coordinates.lat': 1, 'coordinates.lng': 1 });
locationSchema.index({ merchant: 1 });

export const Location = mongoose.model<LocationDocument>('Location', locationSchema);

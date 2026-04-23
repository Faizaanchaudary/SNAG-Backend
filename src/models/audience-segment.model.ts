import mongoose, { Document, Schema } from 'mongoose';

export interface IAudienceSegment {
  name:        string;
  description?: string;
  createdBy:   mongoose.Types.ObjectId; // retailer who created it
  filters: {
    minAge?:        number;
    maxAge?:        number;
    gender?:        string;
    interests?:     string[];
    maxDistanceKm?: number;
    behaviorTags?:  string[];
  };
  estimatedSize: number;
  isDeleted:     boolean;
  createdAt:     Date;
  updatedAt:     Date;
}

export interface AudienceSegmentDocument extends IAudienceSegment, Document {}

const audienceSegmentSchema = new Schema<AudienceSegmentDocument>(
  {
    name:        { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    createdBy:   { type: Schema.Types.ObjectId, ref: 'User', required: true },
    filters: {
      minAge:        { type: Number },
      maxAge:        { type: Number },
      gender:        { type: String, enum: ['male', 'female', 'other', ''] },
      interests:     { type: [String], default: [] },
      maxDistanceKm: { type: Number },
      behaviorTags:  { type: [String], default: [] },
    },
    estimatedSize: { type: Number, default: 0 },
    isDeleted:     { type: Boolean, default: false },
  },
  { timestamps: true },
);

export const AudienceSegment = mongoose.model<AudienceSegmentDocument>('AudienceSegment', audienceSegmentSchema);
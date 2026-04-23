import mongoose, { Document, Schema } from 'mongoose';

export interface IOfferTemplate {
  name:        string;
  description?: string;
  type:        string;
  createdBy:   mongoose.Types.ObjectId; // retailer who created it
  isDeleted:   boolean;
  createdAt:   Date;
  updatedAt:   Date;
}

export interface OfferTemplateDocument extends IOfferTemplate, Document {}

const offerTemplateSchema = new Schema<OfferTemplateDocument>(
  {
    name:        { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    type:        { type: String, required: true, enum: ['percent_off', 'bogo', 'free_gift', 'custom'] },
    createdBy:   { type: Schema.Types.ObjectId, ref: 'User', required: true },
    isDeleted:   { type: Boolean, default: false },
  },
  { timestamps: true },
);

export const OfferTemplate = mongoose.model<OfferTemplateDocument>('OfferTemplate', offerTemplateSchema);
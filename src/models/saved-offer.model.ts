import mongoose, { Document, Schema } from 'mongoose';

export interface ISavedOffer {
  client: mongoose.Types.ObjectId;
  offer:  mongoose.Types.ObjectId;
  savedAt: Date;
}

export interface SavedOfferDocument extends ISavedOffer, Document {}

const savedOfferSchema = new Schema<SavedOfferDocument>(
  {
    client: { type: Schema.Types.ObjectId, ref: 'User',  required: true },
    offer:  { type: Schema.Types.ObjectId, ref: 'Offer', required: true },
    savedAt: { type: Date, default: Date.now },
  },
  { timestamps: false },
);

savedOfferSchema.index({ client: 1, offer: 1 }, { unique: true });

export const SavedOffer = mongoose.model<SavedOfferDocument>('SavedOffer', savedOfferSchema);

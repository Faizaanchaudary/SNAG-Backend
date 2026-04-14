import mongoose, { Document, Schema } from 'mongoose';

export const FEEDBACK_RATINGS = { GOOD: 'good', BAD: 'bad' } as const;
export type FeedbackRating = (typeof FEEDBACK_RATINGS)[keyof typeof FEEDBACK_RATINGS];

export interface IFeedback {
  client:   mongoose.Types.ObjectId;
  offer:    mongoose.Types.ObjectId;
  merchant: mongoose.Types.ObjectId;
  rating:   FeedbackRating;
  comment?: string;
  createdAt: Date;
}

export interface FeedbackDocument extends IFeedback, Document {}

const feedbackSchema = new Schema<FeedbackDocument>(
  {
    client:   { type: Schema.Types.ObjectId, ref: 'User',  required: true },
    offer:    { type: Schema.Types.ObjectId, ref: 'Offer', required: true },
    merchant: { type: Schema.Types.ObjectId, ref: 'User',  required: true },
    rating:   { type: String, enum: Object.values(FEEDBACK_RATINGS), required: true },
    comment:  { type: String, trim: true },
  },
  { timestamps: true },
);

feedbackSchema.index({ merchant: 1 });
feedbackSchema.index({ offer: 1 });

export const Feedback = mongoose.model<FeedbackDocument>('Feedback', feedbackSchema);

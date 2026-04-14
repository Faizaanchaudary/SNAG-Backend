import mongoose from 'mongoose';

// Create Rating model
const ratingSchema = new mongoose.Schema({
  merchant: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String, trim: true },
  createdAt: { type: Date, default: Date.now },
});

ratingSchema.index({ merchant: 1 });

export const Rating = mongoose.model('MerchantRating', ratingSchema);

export const createRating = async (
  merchantId: string,
  rating: number,
  comment?: string,
) => {
  const doc = await new Rating({ merchant: merchantId, rating, comment }).save();
  return doc.toObject();
};

export const getAverageRating = async (merchantId: string) => {
  const result = await Rating.aggregate([
    { $match: { merchant: new mongoose.Types.ObjectId(merchantId) } },
    { $group: { _id: null, avgRating: { $avg: '$rating' }, totalRatings: { $sum: 1 } } },
  ]);
  
  return result[0] || { avgRating: 0, totalRatings: 0 };
};

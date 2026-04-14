import * as ratingRepository from './rating.repository.js';
import type { SubmitRatingDto } from './rating.validation.js';

export const submitRating = async (merchantId: string, dto: SubmitRatingDto) => {
  const rating = await ratingRepository.createRating(
    merchantId,
    dto.rating,
    dto.comment,
  );

  return {
    ratingId: rating._id,
    rating: rating.rating,
    comment: rating.comment,
    createdAt: rating.createdAt,
  };
};

export const getMerchantRating = async (merchantId: string) => {
  return ratingRepository.getAverageRating(merchantId);
};

import { Feedback, FeedbackDocument, FeedbackRating } from '@models/feedback.model.js';

export const createFeedback = (
  clientId:   string,
  offerId:    string,
  merchantId: string,
  rating:     FeedbackRating,
  comment?:   string,
): Promise<FeedbackDocument> =>
  new Feedback({ client: clientId, offer: offerId, merchant: merchantId, rating, comment }).save();

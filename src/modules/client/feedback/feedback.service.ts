import { NotFoundError } from '@core/errors/app-error.js';
import { Offer } from '@models/offer.model.js';
import * as feedbackRepository from './feedback.repository.js';
import type { SubmitFeedbackDto } from './feedback.validation.js';
import { createNotification } from '@modules/notifications/notifications.service.js';

export const submitFeedback = async (clientId: string, dto: SubmitFeedbackDto) => {
  const offer = await Offer.findById(dto.offerId).lean().exec();
  if (!offer) throw new NotFoundError('Offer not found');

  const feedback = await feedbackRepository.createFeedback(
    clientId,
    dto.offerId,
    offer.merchant.toString(),
    dto.rating,
    dto.comment,
  );

  // Send notifications
  try {
    // Notify client about feedback submission
    await createNotification({
      userId: clientId,
      userType: 'client',
      type: 'system',
      title: 'Feedback Submitted ✅',
      message: `Thank you for your feedback on "${offer.title}".`,
      metadata: {
        offerId: offer._id,
        feedbackId: feedback._id,
      },
    });

    // Notify merchant about new feedback
    const ratingEmoji = dto.rating === 'good' ? '👍' : '👎';
    await createNotification({
      userId: offer.merchant.toString(),
      userType: 'merchant',
      type: 'system',
      title: `New Feedback ${ratingEmoji}`,
      message: `You received ${dto.rating} feedback on "${offer.title}"${dto.comment ? ': ' + dto.comment.substring(0, 50) : ''}.`,
      metadata: {
        offerId: offer._id,
        feedbackId: feedback._id,
        clientId,
        rating: dto.rating,
        actionUrl: `/merchant/feedback/${feedback._id}`,
      },
    });
  } catch (notifError) {
    console.error('❌ Failed to send feedback notifications:', notifError);
  }

  return {
    feedbackId: feedback.id,
    rating:     feedback.rating,
    comment:    feedback.comment,
    createdAt:  feedback.createdAt,
  };
};

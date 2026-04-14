import { Router } from 'express';
import { authenticate } from '@middleware/auth.js';
import { validateBody } from '@middleware/validation.js';
import { submitRatingSchema } from './rating.validation.js';
import * as ratingController from './rating.controller.js';

const router = Router();

// Submit rating for a merchant (any authenticated user can rate)
router.post('/:merchantId', authenticate, validateBody(submitRatingSchema), ratingController.submitRating);

// Get merchant's average rating (public)
router.get('/:merchantId', ratingController.getMerchantRating);

export default router;

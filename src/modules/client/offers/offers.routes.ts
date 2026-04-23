import { Router } from 'express';
import { authenticate, requireRole } from '@middleware/auth.js';
import { validateQuery } from '@middleware/validation.js';
import { USER_ROLES } from '@common/constants.js';
import { discoverOffersSchema, myOffersFilterSchema, savedOffersFilterSchema } from './offers.validation.js';
import * as offersController from './offers.controller.js';

const router = Router();

router.use(authenticate, requireRole(USER_ROLES.CLIENT));

// Discover (home map + search)
router.get('/',    validateQuery(discoverOffersSchema), offersController.discoverOffers);
router.get('/my-offers', validateQuery(myOffersFilterSchema), offersController.getMyOffers);
router.get('/saved', validateQuery(savedOffersFilterSchema), offersController.getSavedOffers);
router.get('/:id', offersController.getOfferById);

// Save / Unsave
router.post('/:id/save',   offersController.saveOffer);
router.delete('/:id/save', offersController.unsaveOffer);

// Snag
router.post('/:id/snag', offersController.snagOffer);

// Click tracking
router.post('/:id/click', offersController.clickOffer);

export default router;

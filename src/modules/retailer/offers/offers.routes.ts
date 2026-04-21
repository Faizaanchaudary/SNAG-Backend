import { Router } from 'express';
import { authenticate, requireRole } from '@middleware/auth.js';
import { validateBody, validateQuery } from '@middleware/validation.js';
import { uploadImage } from '@middleware/upload.js';
import { USER_ROLES } from '@common/constants.js';
import * as offersController from './offers.controller.js';
import { createOfferSchema, updateOfferSchema, offersFilterSchema } from './offers.validation.js';

const router = Router();

router.use(authenticate);
router.use(requireRole(USER_ROLES.RETAILER));

router.get('/',    validateQuery(offersFilterSchema), offersController.listOffers);
router.get('/:id', offersController.getOffer);
router.post('/',   uploadImage.single('banner'), validateBody(createOfferSchema), offersController.createOffer);
router.put('/:id', uploadImage.single('banner'), validateBody(updateOfferSchema), offersController.updateOffer);
router.delete('/:id', offersController.deleteOffer);

export default router;

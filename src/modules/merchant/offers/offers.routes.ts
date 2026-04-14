import { Router } from 'express';

import { USER_ROLES } from '@common/constants.js';
import { authenticate, requireRole } from '@middleware/auth.js';
import { uploadImage } from '@middleware/upload.js';
import { validateBody, validateQuery } from '@middleware/validation.js';

import * as offersController from './offers.controller.js';
import {
  basicInfoSchema,
  editOfferSchema,
  locationInfoSchema,
  offersFilterSchema,
  scanInfoSchema,
  targetAudienceSchema,
} from './offers.validation.js';

const router = Router();

router.use(authenticate, requireRole(USER_ROLES.MERCHANT));

// ── CRUD ──────────────────────────────────────────────────────────────────────
router.get('/dashboard-stats', offersController.getDashboardStats);
router.get('/',    validateQuery(offersFilterSchema), offersController.getOffers);
router.get('/merchant-locations', offersController.getMerchantLocations);
router.get('/:id', offersController.getOfferById);
router.get('/:id/stats', offersController.getOfferStats);

// Tab 1 — Basic Info (with optional banner upload)
router.post(
  '/',
  uploadImage.single('banner'),
  validateBody(basicInfoSchema),
  offersController.createOffer,
);

// Tab 2 — Scan Info (with optional QR + barcode uploads)
router.patch(
  '/:id/scan',
  uploadImage.fields([{ name: 'qrCode', maxCount: 1 }, { name: 'barCode', maxCount: 1 }]),
  validateBody(scanInfoSchema),
  offersController.updateScanInfo,
);

// Tab 3 — Location Info
router.patch(
  '/:id/location',
  validateBody(locationInfoSchema),
  offersController.updateLocationInfo,
);

// Target Audience
router.patch(
  '/:id/audience',
  validateBody(targetAudienceSchema),
  offersController.updateTargetAudience,
);

// Delete
router.delete('/:id', offersController.deleteOffer);

// Edit (combined — Edit Offer screen Save Details button)
router.patch(
  '/:id',
  uploadImage.single('banner'),
  validateBody(editOfferSchema),
  offersController.editOffer,
);

export default router;

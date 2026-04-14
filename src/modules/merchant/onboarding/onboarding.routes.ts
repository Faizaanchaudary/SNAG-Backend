import { Router } from 'express';
import { authenticate, requireRole } from '@middleware/auth.js';
import { validateBody } from '@middleware/validation.js';
import { uploadImage, uploadCsv } from '@middleware/upload.js';
import { USER_ROLES } from '@common/constants.js';
import {
  branchProfileSchema,
  addLocationSchema,
  branchInfoSchema,
  bulkUploadSchema,
  saveMerchantLocationSchema,
  editLocationSchema,
} from './onboarding.validation.js';
import * as onboardingController from './onboarding.controller.js';

const router = Router();

// All onboarding routes require a verified merchant token
router.use(authenticate, requireRole(USER_ROLES.MERCHANT));

router.post(
  '/branch-profile',
  uploadImage.single('logo'),
  validateBody(branchProfileSchema),
  onboardingController.saveBranchProfile,
);

router.post(
  '/locations',
  uploadImage.single('banner'),
  validateBody(addLocationSchema),
  onboardingController.addLocation,
);

router.post(
  '/branch-info',
  validateBody(branchInfoSchema),
  onboardingController.saveBranchInfo,
);

router.post(
  '/locations/bulk',
  uploadCsv.single('file'),
  validateBody(bulkUploadSchema),
  onboardingController.bulkUploadLocations,
);

router.get('/locations', onboardingController.getLocations);

// Single location CRUD (Settings → Locations section)
router.get('/locations/:id',    onboardingController.getLocationById);
router.patch(
  '/locations/:id',
  uploadImage.single('banner'),
  validateBody(editLocationSchema),
  onboardingController.editLocation,
);
router.delete('/locations/:id', onboardingController.deleteLocation);

router.post('/complete', onboardingController.completeOnboarding);

// Merchant's own current GPS location (separate from branch locations)
router.post(
  '/my-location',
  validateBody(saveMerchantLocationSchema),
  onboardingController.saveMerchantLocation,
);

// Edit branch profile (Settings → Edit Profile)
router.patch(
  '/branch-profile',
  uploadImage.single('logo'),
  validateBody(branchProfileSchema.partial()),
  onboardingController.saveBranchProfile, // upsert handles both create + update
);

// Get branch profile
router.get('/branch-profile', onboardingController.getBranchProfile);

export default router;

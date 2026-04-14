import { Router } from 'express';
import { authenticate, requireRole } from '@middleware/auth.js';
import { validateBody } from '@middleware/validation.js';
import { uploadImage } from '@middleware/upload.js';
import { USER_ROLES } from '@common/constants.js';
import { saveLocationSchema, saveInterestsSchema } from './onboarding.validation.js';
import * as onboardingController from './onboarding.controller.js';

const router = Router();

router.use(authenticate, requireRole(USER_ROLES.CLIENT));

router.post('/location',   validateBody(saveLocationSchema),  onboardingController.saveLocation);
router.post('/interests',  validateBody(saveInterestsSchema), onboardingController.saveInterests);
router.post('/avatar',     uploadImage.single('image'),       onboardingController.uploadAvatar);
router.post('/complete',                                       onboardingController.completeOnboarding);

export default router;

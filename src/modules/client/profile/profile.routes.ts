import { Router } from 'express';
import { authenticate, requireRole } from '@middleware/auth.js';
import { validateBody } from '@middleware/validation.js';
import { uploadImage } from '@middleware/upload.js';
import { USER_ROLES } from '@common/constants.js';
import { updateInterestsSchema } from './profile.validation.js';
import * as profileController from './profile.controller.js';

const router = Router();

router.use(authenticate, requireRole(USER_ROLES.CLIENT));

router.get('/',       profileController.getProfile);
router.patch('/',     validateBody(updateInterestsSchema), profileController.updateInterests);
router.patch('/avatar', uploadImage.single('image'), profileController.updateAvatar);

export default router;

import { Router } from 'express';
import { authenticate, requireRole } from '@middleware/auth.js';
import { validateBody } from '@middleware/validation.js';
import { uploadImage } from '@middleware/upload.js';
import { USER_ROLES } from '@common/constants.js';
import * as profileController from './profile.controller.js';
import { updateProfileSchema } from './profile.validation.js';

const router = Router();

router.use(authenticate);
router.use(requireRole(USER_ROLES.RETAILER));

router.get('/',             profileController.getProfile);
router.put('/',             validateBody(updateProfileSchema), profileController.updateProfile);
router.post('/avatar',      uploadImage.single('avatar'),      profileController.uploadAvatar);

export default router;

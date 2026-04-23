import { Router } from 'express';
import { authenticate, requireRole } from '@middleware/auth.js';
import { validateQuery } from '@middleware/validation.js';
import { uploadImage } from '@middleware/upload.js';
import { USER_ROLES } from '@common/constants.js';
import * as brandAssetsController from './brand-assets.controller.js';
import { brandAssetsFilterSchema } from './brand-assets.validation.js';

const router = Router();

router.use(authenticate);
router.use(requireRole(USER_ROLES.RETAILER));

router.get('/', validateQuery(brandAssetsFilterSchema), brandAssetsController.getBrandAssets);
router.post('/:id/upload-logo', uploadImage.single('logo'), brandAssetsController.uploadLogo);
router.delete('/:id/logo', brandAssetsController.removeLogo);
router.delete('/:id', brandAssetsController.deleteBrandAsset);

export default router;
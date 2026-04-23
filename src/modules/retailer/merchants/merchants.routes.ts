import { Router } from 'express';
import { authenticate, requireRole } from '@middleware/auth.js';
import { validateBody, validateQuery } from '@middleware/validation.js';
import { USER_ROLES } from '@common/constants.js';
import * as merchantsController from './merchants.controller.js';
import { createMerchantSchema, updateMerchantSchema, merchantsFilterSchema } from './merchants.validation.js';

const router = Router();

router.use(authenticate);
router.use(requireRole(USER_ROLES.RETAILER));

router.get('/', validateQuery(merchantsFilterSchema), merchantsController.getMerchants);
router.post('/', validateBody(createMerchantSchema), merchantsController.createMerchant);
router.put('/:id', validateBody(updateMerchantSchema), merchantsController.updateMerchant);
router.put('/:id/deactivate', merchantsController.deactivateMerchant);
router.put('/:id/activate', merchantsController.activateMerchant);

export default router;
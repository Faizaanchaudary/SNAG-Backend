import { Router } from 'express';
import { authenticate, requireRole } from '@middleware/auth.js';
import { USER_ROLES } from '@common/constants.js';
import * as redemptionsController from './redemptions.controller.js';

const router = Router();

// All admin redemption routes require admin authentication
router.use(authenticate);
router.use(requireRole(USER_ROLES.ADMIN));

// Redemption operations
router.get('/', ...redemptionsController.listRedemptions);
router.get('/stats', redemptionsController.getRedemptionStats);
router.get('/:id', redemptionsController.getRedemptionById);

export default router;
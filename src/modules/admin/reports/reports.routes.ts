import { Router } from 'express';
import { authenticate, requireRole } from '@middleware/auth.js';
import { USER_ROLES } from '@common/constants.js';
import * as reportsController from './reports.controller.js';

const router = Router();

// All admin reports routes require admin authentication
router.use(authenticate);
router.use(requireRole(USER_ROLES.ADMIN));

// Report endpoints
router.get('/users', reportsController.getUserReports);
router.get('/merchants', reportsController.getMerchantReports);
router.get('/financials', reportsController.getFinancialReports);
router.get('/fraud', reportsController.getFraudReports);
router.get('/offers', reportsController.getOfferReports);

export default router;
import { Router } from 'express';
import { authenticate, requireRole } from '@middleware/auth.js';
import { USER_ROLES } from '@common/constants.js';
import * as analyticsController from './analytics.controller.js';

const router = Router();

// All admin analytics routes require admin authentication
router.use(authenticate);
router.use(requireRole(USER_ROLES.ADMIN));

// Analytics endpoints
router.get('/kpis', analyticsController.getKpis);
router.get('/transactions', analyticsController.getTransactions);
router.get('/transactions.csv', analyticsController.exportTransactionsCsv);

export default router;
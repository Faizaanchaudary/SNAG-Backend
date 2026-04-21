import { Router } from 'express';
import { authenticate, requireRole } from '@middleware/auth.js';
import { USER_ROLES } from '@common/constants.js';
import * as dashboardController from './dashboard.controller.js';

const router = Router();

// All admin dashboard routes require admin authentication
router.use(authenticate);
router.use(requireRole(USER_ROLES.ADMIN));

// Dashboard KPIs
router.get('/kpis', dashboardController.getKpis);

// Sentiment distribution (platform breakdown)
router.get('/sentiment', dashboardController.getSentimentDistribution);

// Offers redeemed analytics
router.get('/offers-redeemed', dashboardController.getOffersRedeemed);

// Monthly revenue analytics
router.get('/monthly-revenue', dashboardController.getMonthlyRevenue);

// Revenue split by category
router.get('/revenue-split', dashboardController.getRevenueSplit);

export default router;
import { Router } from 'express';
import { authenticate, requireRole } from '@middleware/auth.js';
import { USER_ROLES } from '@common/constants.js';
import * as dashboardController from './dashboard.controller.js';

const router = Router();

router.use(authenticate);
router.use(requireRole(USER_ROLES.RETAILER));

router.get('/summary',           dashboardController.getSummary);
router.get('/views-impressions', dashboardController.getViewsAndImpressions);
router.get('/redemptions',       dashboardController.getRedemptions);
router.get('/top-offers',        dashboardController.getTopOffers);

export default router;

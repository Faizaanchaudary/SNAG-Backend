import { Router } from 'express';
import { authenticate, requireRole } from '@middleware/auth.js';
import { validateQuery } from '@middleware/validation.js';
import { USER_ROLES } from '@common/constants.js';
import * as dashboardController from './dashboard.controller.js';
import { topOffersQuerySchema, activityQuerySchema } from './dashboard.validation.js';

const router = Router();

router.use(authenticate);
router.use(requireRole(USER_ROLES.RETAILER));

router.get('/summary',           dashboardController.getSummary);
router.get('/views-impressions', dashboardController.getViewsAndImpressions);
router.get('/redemptions',       dashboardController.getRedemptions);
router.get('/top-offers',        validateQuery(topOffersQuerySchema), dashboardController.getTopOffers);
router.get('/activity',          validateQuery(activityQuerySchema), dashboardController.getActivity);

export default router;

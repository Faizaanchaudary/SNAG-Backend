import { Router } from 'express';
import { authenticate, requireRole } from '@middleware/auth.js';
import { validateQuery } from '@middleware/validation.js';
import { USER_ROLES } from '@common/constants.js';
import { analyticsFiltersSchema } from './analytics.validation.js';
import * as analyticsController from './analytics.controller.js';

const router = Router();

router.use(authenticate, requireRole(USER_ROLES.MERCHANT));

router.get('/home', validateQuery(analyticsFiltersSchema), analyticsController.getHomeStats);
router.get('/summary', validateQuery(analyticsFiltersSchema), analyticsController.getSummaryStats);
router.get('/offers', validateQuery(analyticsFiltersSchema), analyticsController.getOffersAnalytics);
router.get('/users', validateQuery(analyticsFiltersSchema), analyticsController.getUsersAnalytics);

export default router;

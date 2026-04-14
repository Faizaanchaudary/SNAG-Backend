import { Router } from 'express';
import { authenticate, requireRole } from '@middleware/auth.js';
import { USER_ROLES } from '@common/constants.js';
import * as scorecardController from './scorecard.controller.js';

const router = Router();

router.use(authenticate, requireRole(USER_ROLES.CLIENT));

router.get('/', scorecardController.getScorecard);

export default router;

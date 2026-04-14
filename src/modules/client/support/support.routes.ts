import { Router } from 'express';
import { authenticate, requireRole } from '@middleware/auth.js';
import { validateBody } from '@middleware/validation.js';
import { USER_ROLES } from '@common/constants.js';
import { submitSupportSchema } from './support.validation.js';
import * as supportController from './support.controller.js';

const router = Router();

router.use(authenticate, requireRole(USER_ROLES.CLIENT));

router.post('/', validateBody(submitSupportSchema), supportController.submitSupportTicket);

export default router;

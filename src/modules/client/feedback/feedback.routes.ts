import { Router } from 'express';
import { authenticate, requireRole } from '@middleware/auth.js';
import { validateBody } from '@middleware/validation.js';
import { USER_ROLES } from '@common/constants.js';
import { submitFeedbackSchema } from './feedback.validation.js';
import * as feedbackController from './feedback.controller.js';

const router = Router();

router.use(authenticate, requireRole(USER_ROLES.CLIENT));

router.post('/', validateBody(submitFeedbackSchema), feedbackController.submitFeedback);

export default router;

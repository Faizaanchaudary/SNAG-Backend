import { Router } from 'express';
import { authenticate, requireRole } from '@middleware/auth.js';
import { validateBody } from '@middleware/validation.js';
import { USER_ROLES } from '@common/constants.js';
import { preferencesSchema } from './preferences.validation.js';
import * as preferencesController from './preferences.controller.js';

const router = Router();

router.use(authenticate, requireRole(USER_ROLES.CLIENT));

router.get('/', preferencesController.getPreferences);
router.patch('/', validateBody(preferencesSchema), preferencesController.updatePreferences);

export default router;

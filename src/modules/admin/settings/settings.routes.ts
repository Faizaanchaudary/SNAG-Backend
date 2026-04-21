import { Router } from 'express';
import { authenticate, requireRole } from '@middleware/auth.js';
import { USER_ROLES } from '@common/constants.js';
import * as settingsController from './settings.controller.js';

const router = Router();

// All admin settings routes require admin authentication
router.use(authenticate);
router.use(requireRole(USER_ROLES.ADMIN));

// Settings endpoints
router.get('/', settingsController.getSettings);
router.put('/', ...settingsController.updateSettings);

// Admin controls
router.get('/admin-controls', settingsController.getAdminControls);
router.put('/admin-controls', settingsController.updateAdminControls);

export default router;
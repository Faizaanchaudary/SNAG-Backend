import { Router } from 'express';
import { authenticate } from '@middleware/auth.js';
import { validateBody } from '@middleware/validation.js';
import * as merchantSettingsController from './settings.controller.js';
import { updateMerchantSettingsSchema } from './settings.validation.js';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Get merchant notification settings
router.get('/notifications', merchantSettingsController.getSettings);

// Update merchant notification settings
router.patch(
  '/notifications',
  validateBody(updateMerchantSettingsSchema),
  merchantSettingsController.updateSettings
);

export default router;

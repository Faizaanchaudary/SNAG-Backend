import { Router } from 'express';
import { authenticate, requireRole } from '@middleware/auth.js';
import { validateBody, validateQuery } from '@middleware/validation.js';
import { USER_ROLES } from '@common/constants.js';
import * as templatesController from './templates.controller.js';
import { createTemplateSchema, updateTemplateSchema, templatesFilterSchema } from './templates.validation.js';

const router = Router();

router.use(authenticate);
router.use(requireRole(USER_ROLES.RETAILER));

router.get('/',     validateQuery(templatesFilterSchema), templatesController.getTemplates);
router.post('/',    validateBody(createTemplateSchema),   templatesController.createTemplate);
router.put('/:id',  validateBody(updateTemplateSchema),   templatesController.updateTemplate);
router.delete('/:id',                                     templatesController.deleteTemplate);

export default router;
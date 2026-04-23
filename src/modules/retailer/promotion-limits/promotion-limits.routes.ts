import { Router } from 'express';
import { authenticate, requireRole } from '@middleware/auth.js';
import { validateBody, validateQuery } from '@middleware/validation.js';
import { USER_ROLES } from '@common/constants.js';
import * as rulesController from './promotion-limits.controller.js';
import { createRuleSchema, updateRuleSchema, rulesFilterSchema } from './promotion-limits.validation.js';

const router = Router();

router.use(authenticate);
router.use(requireRole(USER_ROLES.RETAILER));

router.get('/',     validateQuery(rulesFilterSchema), rulesController.getRules);
router.post('/',    validateBody(createRuleSchema),   rulesController.createRule);
router.put('/:id',  validateBody(updateRuleSchema),   rulesController.updateRule);
router.delete('/:id',                                 rulesController.deleteRule);

export default router;
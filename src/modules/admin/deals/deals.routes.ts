import { Router } from 'express';
import { authenticate, requireRole } from '@middleware/auth.js';
import { auditLog } from '@middleware/audit.js';
import { USER_ROLES } from '@common/constants.js';
import * as dealsController from './deals.controller.js';

const router = Router();

// All admin deals routes require admin authentication
router.use(authenticate);
router.use(requireRole(USER_ROLES.ADMIN));

// Deal management operations with audit logging
router.get('/', dealsController.listDeals);
router.get('/:id', dealsController.getDealById);
router.post('/', auditLog('CREATE', 'deal'), ...dealsController.createDeal);
router.put('/:id', auditLog('UPDATE', 'deal'), ...dealsController.updateDeal);
router.delete('/:id', auditLog('DELETE', 'deal'), dealsController.deleteDeal);

// Deal status management with audit logging
router.patch('/:id/approve', auditLog('APPROVE', 'deal'), dealsController.approveDeal);
router.patch('/:id/reject', auditLog('REJECT', 'deal'), dealsController.rejectDeal);
router.patch('/:id/flag', auditLog('FLAG', 'deal'), dealsController.flagDeal);
router.patch('/:id/archive', auditLog('ARCHIVE', 'deal'), dealsController.archiveDeal);

export default router;
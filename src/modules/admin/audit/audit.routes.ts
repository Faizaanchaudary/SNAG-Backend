import { Router } from 'express';
import { authenticate, requireRole } from '@middleware/auth.js';
import { USER_ROLES } from '@common/constants.js';
import * as auditController from './audit.controller.js';

const router = Router();

// All admin audit routes require admin authentication
router.use(authenticate);
router.use(requireRole(USER_ROLES.ADMIN));

// Audit log operations
router.get('/', ...auditController.listAuditLogs);
router.get('/stats', auditController.getAuditStats);

export default router;
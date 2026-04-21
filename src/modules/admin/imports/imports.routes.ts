import { Router } from 'express';
import { authenticate, requireRole } from '@middleware/auth.js';
import { auditLog } from '@middleware/audit.js';
import { USER_ROLES } from '@common/constants.js';
import * as importsController from './imports.controller.js';

const router = Router();

// All admin import routes require admin authentication
router.use(authenticate);
router.use(requireRole(USER_ROLES.ADMIN));

// Import operations with audit logging
router.get('/', ...importsController.listImportJobs);
router.get('/:importId', importsController.getImportStatus);
router.post('/offers', auditLog('IMPORT', 'offers'), ...importsController.importOffers);

export default router;
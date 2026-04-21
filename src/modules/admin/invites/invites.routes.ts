import { Router } from 'express';
import { authenticate, requireRole } from '@middleware/auth.js';
import { auditLog } from '@middleware/audit.js';
import { USER_ROLES } from '@common/constants.js';
import * as invitesController from './invites.controller.js';

const router = Router();

// All admin invite routes require admin authentication
router.use(authenticate);
router.use(requireRole(USER_ROLES.ADMIN));

// Invite management operations with audit logging
router.get('/', invitesController.listInvites);
router.get('/:id', invitesController.getInviteById);
router.post('/', auditLog('CREATE', 'invite'), ...invitesController.createInvite);
router.put('/:id', auditLog('UPDATE', 'invite'), ...invitesController.updateInvite);
router.delete('/:id', auditLog('DELETE', 'invite'), invitesController.deleteInvite);

// Invite status management with audit logging
router.patch('/:id/cancel', auditLog('CANCEL', 'invite'), invitesController.cancelInvite);

export default router;
import { Router } from 'express';
import { authenticate, requireRole } from '@middleware/auth.js';
import { auditLog } from '@middleware/audit.js';
import { USER_ROLES } from '@common/constants.js';
import * as usersController from './users.controller.js';

const router = Router();

// All admin user routes require admin authentication
router.use(authenticate);
router.use(requireRole(USER_ROLES.ADMIN));

// User CRUD operations with audit logging
router.get('/', usersController.listUsers);
router.get('/:id', usersController.getUserById);
router.post('/', auditLog('CREATE', 'user'), ...usersController.createUser);
router.put('/:id', auditLog('UPDATE', 'user'), ...usersController.updateUser);
router.delete('/:id', auditLog('DELETE', 'user'), usersController.deleteUser);

// User status management with audit logging
router.patch('/:id/suspend', auditLog('SUSPEND', 'user'), usersController.suspendUser);
router.patch('/:id/activate', auditLog('ACTIVATE', 'user'), usersController.activateUser);

export default router;
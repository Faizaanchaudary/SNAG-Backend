import { Router } from 'express';
import { authenticate, requireRole } from '@middleware/auth.js';
import { auditLog } from '@middleware/audit.js';
import { USER_ROLES } from '@common/constants.js';
import * as retailersController from './retailers.controller.js';

const router = Router();

// All admin retailer routes require admin authentication
router.use(authenticate);
router.use(requireRole(USER_ROLES.ADMIN));

// Retailer management operations with audit logging
router.get('/', retailersController.listRetailers);
router.get('/:id', retailersController.getRetailerById);
router.post('/', auditLog('CREATE', 'retailer'), ...retailersController.createRetailer);
router.put('/:id', auditLog('UPDATE', 'retailer'), ...retailersController.updateRetailer);
router.delete('/:id', auditLog('DELETE', 'retailer'), retailersController.deleteRetailer);

// Retailer approval management with audit logging
router.patch('/:id/approve', auditLog('APPROVE', 'retailer'), retailersController.approveRetailer);
router.patch('/:id/reject', auditLog('REJECT', 'retailer'), retailersController.rejectRetailer);

export default router;
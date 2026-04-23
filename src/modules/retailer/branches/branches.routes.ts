import { Router } from 'express';
import { authenticate, requireRole } from '@middleware/auth.js';
import { validateBody, validateQuery } from '@middleware/validation.js';
import { uploadImage } from '@middleware/upload.js';
import { USER_ROLES } from '@common/constants.js';
import * as branchesController from './branches.controller.js';
import { createBranchSchema, updateBranchSchema, branchesFilterSchema } from './branches.validation.js';

const router = Router();

router.use(authenticate);
router.use(requireRole(USER_ROLES.RETAILER));

router.get('/', validateQuery(branchesFilterSchema), branchesController.getBranches);
router.get('/merchants', branchesController.getMerchantsForDropdown);
router.post('/', uploadImage.single('logo'), validateBody(createBranchSchema), branchesController.createBranch);
router.put('/:id', uploadImage.single('logo'), validateBody(updateBranchSchema), branchesController.updateBranch);
router.delete('/:id', branchesController.deleteBranch);

export default router;
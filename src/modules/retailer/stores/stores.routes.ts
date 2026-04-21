import { Router } from 'express';
import { authenticate, requireRole } from '@middleware/auth.js';
import { validateBody } from '@middleware/validation.js';
import { USER_ROLES } from '@common/constants.js';
import * as storesController from './stores.controller.js';
import { createStoreSchema, updateStoreSchema } from './stores.validation.js';

const router = Router();

router.use(authenticate);
router.use(requireRole(USER_ROLES.RETAILER));

router.get('/',    storesController.listStores);
router.get('/:id', storesController.getStore);
router.post('/',   validateBody(createStoreSchema), storesController.createStore);
router.put('/:id', validateBody(updateStoreSchema), storesController.updateStore);
router.delete('/:id', storesController.deleteStore);

export default router;

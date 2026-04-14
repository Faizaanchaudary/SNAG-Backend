import { Router } from 'express';
import { authenticate, requireRole } from '@middleware/auth.js';
import { validateBody } from '@middleware/validation.js';
import { USER_ROLES } from '@common/constants.js';
import { shippingAddressSchema } from './shipping-addresses.validation.js';
import * as shippingAddressController from './shipping-addresses.controller.js';

const router = Router();

router.use(authenticate, requireRole(USER_ROLES.CLIENT));

router.get('/', shippingAddressController.getAddresses);
router.post('/', validateBody(shippingAddressSchema), shippingAddressController.createAddress);
router.get('/:id', shippingAddressController.getAddressById);
router.patch('/:id', validateBody(shippingAddressSchema.partial()), shippingAddressController.updateAddress);
router.delete('/:id', shippingAddressController.deleteAddress);
router.patch('/:id/set-default', shippingAddressController.setDefaultAddress);

export default router;

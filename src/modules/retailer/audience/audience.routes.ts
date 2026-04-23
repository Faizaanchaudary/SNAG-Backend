import { Router } from 'express';
import { authenticate, requireRole } from '@middleware/auth.js';
import { validateBody, validateQuery } from '@middleware/validation.js';
import { USER_ROLES } from '@common/constants.js';
import * as audienceController from './audience.controller.js';
import { createSegmentSchema, updateSegmentSchema, segmentsFilterSchema } from './audience.validation.js';

const router = Router();

router.use(authenticate);
router.use(requireRole(USER_ROLES.RETAILER));

router.get('/',     validateQuery(segmentsFilterSchema), audienceController.getSegments);
router.post('/',    validateBody(createSegmentSchema),   audienceController.createSegment);
router.put('/:id',  validateBody(updateSegmentSchema),   audienceController.updateSegment);
router.delete('/:id',                                    audienceController.deleteSegment);

export default router;
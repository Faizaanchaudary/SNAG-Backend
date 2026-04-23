import { Router } from 'express';
import { authenticate, requireRole } from '@middleware/auth.js';
import { validateBody, validateQuery } from '@middleware/validation.js';
import multer from 'multer';
import { USER_ROLES } from '@common/constants.js';
import * as legalController from './legal.controller.js';
import { createDocSchema, updateDocSchema, docsFilterSchema } from './legal.validation.js';

const router = Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 20 * 1024 * 1024 } });

router.use(authenticate);
router.use(requireRole(USER_ROLES.RETAILER));

router.get('/',     validateQuery(docsFilterSchema),  legalController.getDocs);
router.post('/',    upload.single('file'), validateBody(createDocSchema), legalController.createDoc);
router.put('/:id',  upload.single('file'), validateBody(updateDocSchema), legalController.updateDoc);
router.delete('/:id',                                  legalController.deleteDoc);

export default router;
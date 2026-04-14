import { Router } from 'express';
import * as industriesController from './industries.controller.js';

const router = Router();

// GET /api/v1/industries — public, no auth
router.get('/', industriesController.getIndustries);

export default router;

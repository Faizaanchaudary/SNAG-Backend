import { Request, Response } from 'express';
import { sendSuccess } from '@core/http/response.js';
import * as rulesService from './promotion-limits.service.js';
import { CreateRuleDto, UpdateRuleDto, RulesFilterDto } from './promotion-limits.validation.js';

/** GET /retailer/promotion-limits */
export const getRules = async (req: Request, res: Response): Promise<void> => {
  const params = req.query as unknown as RulesFilterDto;
  const data = await rulesService.getRules(req.user!.id, params);
  sendSuccess(res, data, 'Promotion rules retrieved');
};

/** POST /retailer/promotion-limits */
export const createRule = async (req: Request, res: Response): Promise<void> => {
  const dto = req.body as CreateRuleDto;
  const rule = await rulesService.createRule(req.user!.id, dto);
  sendSuccess(res, rule, 'Promotion rule created', 201);
};

/** PUT /retailer/promotion-limits/:id */
export const updateRule = async (req: Request, res: Response): Promise<void> => {
  const dto = req.body as UpdateRuleDto;
  const rule = await rulesService.updateRule(req.user!.id, req.params['id'], dto);
  sendSuccess(res, rule, 'Promotion rule updated');
};

/** DELETE /retailer/promotion-limits/:id */
export const deleteRule = async (req: Request, res: Response): Promise<void> => {
  await rulesService.deleteRule(req.user!.id, req.params['id']);
  sendSuccess(res, { deleted: true }, 'Promotion rule deleted');
};
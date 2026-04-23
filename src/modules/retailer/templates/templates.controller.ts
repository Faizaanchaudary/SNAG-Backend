import { Request, Response } from 'express';
import { sendSuccess } from '@core/http/response.js';
import * as templatesService from './templates.service.js';
import { CreateTemplateDto, UpdateTemplateDto, TemplatesFilterDto } from './templates.validation.js';

/** GET /retailer/templates */
export const getTemplates = async (req: Request, res: Response): Promise<void> => {
  const params = req.query as unknown as TemplatesFilterDto;
  const data = await templatesService.getTemplates(req.user!.id, params);
  sendSuccess(res, data, 'Templates retrieved');
};

/** POST /retailer/templates */
export const createTemplate = async (req: Request, res: Response): Promise<void> => {
  const dto = req.body as CreateTemplateDto;
  const template = await templatesService.createTemplate(req.user!.id, dto);
  sendSuccess(res, template, 'Template created', 201);
};

/** PUT /retailer/templates/:id */
export const updateTemplate = async (req: Request, res: Response): Promise<void> => {
  const dto = req.body as UpdateTemplateDto;
  const template = await templatesService.updateTemplate(req.user!.id, req.params['id'], dto);
  sendSuccess(res, template, 'Template updated');
};

/** DELETE /retailer/templates/:id */
export const deleteTemplate = async (req: Request, res: Response): Promise<void> => {
  await templatesService.deleteTemplate(req.user!.id, req.params['id']);
  sendSuccess(res, { deleted: true }, 'Template deleted');
};
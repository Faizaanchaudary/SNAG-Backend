import { Request, Response } from 'express';
import { sendSuccess } from '@core/http/response.js';
import * as legalService from './legal.service.js';
import { CreateDocDto, UpdateDocDto, DocsFilterDto } from './legal.validation.js';

/** GET /retailer/legal */
export const getDocs = async (req: Request, res: Response): Promise<void> => {
  const params = req.query as unknown as DocsFilterDto;
  const data = await legalService.getDocs(req.user!.id, params);
  sendSuccess(res, data, 'Documents retrieved');
};

/** POST /retailer/legal */
export const createDoc = async (req: Request, res: Response): Promise<void> => {
  const dto = req.body as CreateDocDto;
  const doc = await legalService.createDoc(req.user!.id, dto, req.file);
  sendSuccess(res, doc, 'Document created', 201);
};

/** PUT /retailer/legal/:id */
export const updateDoc = async (req: Request, res: Response): Promise<void> => {
  const dto = req.body as UpdateDocDto;
  const doc = await legalService.updateDoc(req.user!.id, req.params['id'], dto, req.file);
  sendSuccess(res, doc, 'Document updated');
};

/** DELETE /retailer/legal/:id */
export const deleteDoc = async (req: Request, res: Response): Promise<void> => {
  await legalService.deleteDoc(req.user!.id, req.params['id']);
  sendSuccess(res, { deleted: true }, 'Document deleted');
};
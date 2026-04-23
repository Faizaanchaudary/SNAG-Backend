import { Request, Response } from 'express';
import { sendSuccess } from '@core/http/response.js';
import * as audienceService from './audience.service.js';
import { CreateSegmentDto, UpdateSegmentDto, SegmentsFilterDto } from './audience.validation.js';

/** GET /retailer/audience */
export const getSegments = async (req: Request, res: Response): Promise<void> => {
  const params = req.query as unknown as SegmentsFilterDto;
  const data = await audienceService.getSegments(req.user!.id, params);
  sendSuccess(res, data, 'Segments retrieved');
};

/** POST /retailer/audience */
export const createSegment = async (req: Request, res: Response): Promise<void> => {
  const dto = req.body as CreateSegmentDto;
  const segment = await audienceService.createSegment(req.user!.id, dto);
  sendSuccess(res, segment, 'Segment created', 201);
};

/** PUT /retailer/audience/:id */
export const updateSegment = async (req: Request, res: Response): Promise<void> => {
  const dto = req.body as UpdateSegmentDto;
  const segment = await audienceService.updateSegment(req.user!.id, req.params['id'], dto);
  sendSuccess(res, segment, 'Segment updated');
};

/** DELETE /retailer/audience/:id */
export const deleteSegment = async (req: Request, res: Response): Promise<void> => {
  await audienceService.deleteSegment(req.user!.id, req.params['id']);
  sendSuccess(res, { deleted: true }, 'Segment deleted');
};
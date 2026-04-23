import { Request, Response } from 'express';
import { sendSuccess } from '@core/http/response.js';
import * as merchantsService from './merchants.service.js';
import { CreateMerchantDto, UpdateMerchantDto, MerchantsFilterDto } from './merchants.validation.js';

/** GET /retailer/merchants */
export const getMerchants = async (req: Request, res: Response): Promise<void> => {
  const params = req.query as unknown as MerchantsFilterDto;
  const data = await merchantsService.getMerchants(params);
  sendSuccess(res, data, 'Merchants retrieved');
};

/** POST /retailer/merchants */
export const createMerchant = async (req: Request, res: Response): Promise<void> => {
  const dto = req.body as CreateMerchantDto;
  const merchant = await merchantsService.createMerchant(dto);
  sendSuccess(res, merchant, 'Merchant created successfully', 201);
};

/** PUT /retailer/merchants/:id */
export const updateMerchant = async (req: Request, res: Response): Promise<void> => {
  const merchantId = req.params['id'] as string;
  const dto = req.body as UpdateMerchantDto;
  const merchant = await merchantsService.updateMerchant(merchantId, dto);
  sendSuccess(res, merchant, 'Merchant updated');
};

/** PUT /retailer/merchants/:id/deactivate */
export const deactivateMerchant = async (req: Request, res: Response): Promise<void> => {
  const merchantId = req.params['id'] as string;
  const merchant = await merchantsService.deactivateMerchant(merchantId);
  sendSuccess(res, merchant, 'Merchant deactivated');
};

/** PUT /retailer/merchants/:id/activate */
export const activateMerchant = async (req: Request, res: Response): Promise<void> => {
  const merchantId = req.params['id'] as string;
  const merchant = await merchantsService.activateMerchant(merchantId);
  sendSuccess(res, merchant, 'Merchant activated');
};

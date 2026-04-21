import { Request, Response } from 'express';
import { sendSuccess } from '@core/http/response.js';
import * as storesService from './stores.service.js';

export const listStores = async (req: Request, res: Response): Promise<void> => {
  const page  = Number(req.query['page'])  || 1;
  const limit = Number(req.query['limit']) || 20;
  const result = await storesService.listStores(req.user!.id, page, limit);
  sendSuccess(res, result, 'Stores retrieved');
};

export const getStore = async (req: Request, res: Response): Promise<void> => {
  const store = await storesService.getStore(req.user!.id, req.params['id'] as string);
  sendSuccess(res, store, 'Store retrieved');
};

export const createStore = async (req: Request, res: Response): Promise<void> => {
  const store = await storesService.createStore(req.user!.id, req.body);
  sendSuccess(res, store, 'Store created', 201);
};

export const updateStore = async (req: Request, res: Response): Promise<void> => {
  const store = await storesService.updateStore(req.user!.id, req.params['id'] as string, req.body);
  sendSuccess(res, store, 'Store updated');
};

export const deleteStore = async (req: Request, res: Response): Promise<void> => {
  const result = await storesService.deleteStore(req.user!.id, req.params['id'] as string);
  sendSuccess(res, result, 'Store deleted');
};

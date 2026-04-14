import { Request, Response } from 'express';
import * as shippingAddressService from './shipping-addresses.service.js';
import { sendSuccess } from '@core/http/response.js';

export const createAddress = async (req: Request, res: Response): Promise<void> => {
  const address = await shippingAddressService.createAddress(req.user!.id, req.body);
  sendSuccess(res, address, 'Shipping address created', 201);
};

export const getAddresses = async (req: Request, res: Response): Promise<void> => {
  const addresses = await shippingAddressService.getAddresses(req.user!.id);
  sendSuccess(res, { addresses });
};

export const getAddressById = async (req: Request, res: Response): Promise<void> => {
  const address = await shippingAddressService.getAddressById(
    req.params['id'] as string,
    req.user!.id
  );
  sendSuccess(res, address);
};

export const updateAddress = async (req: Request, res: Response): Promise<void> => {
  const address = await shippingAddressService.updateAddress(
    req.params['id'] as string,
    req.user!.id,
    req.body
  );
  sendSuccess(res, address, 'Shipping address updated');
};

export const deleteAddress = async (req: Request, res: Response): Promise<void> => {
  await shippingAddressService.deleteAddress(req.params['id'] as string, req.user!.id);
  sendSuccess(res, null, 'Shipping address deleted');
};

export const setDefaultAddress = async (req: Request, res: Response): Promise<void> => {
  const address = await shippingAddressService.setDefaultAddress(
    req.params['id'] as string,
    req.user!.id
  );
  sendSuccess(res, address, 'Default address updated');
};

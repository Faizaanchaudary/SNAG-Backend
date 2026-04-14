import * as shippingAddressRepo from './shipping-addresses.repository.js';
import { ShippingAddressDto } from './shipping-addresses.validation.js';
import { IShippingAddress } from '@models/ShippingAddress.js';

export const createAddress = async (
  clientId: string,
  data: ShippingAddressDto
): Promise<IShippingAddress> => {
  return shippingAddressRepo.create(clientId, data);
};

export const getAddresses = async (clientId: string): Promise<IShippingAddress[]> => {
  return shippingAddressRepo.findAllByClient(clientId);
};

export const getAddressById = async (
  id: string,
  clientId: string
): Promise<IShippingAddress> => {
  return shippingAddressRepo.findById(id, clientId);
};

export const updateAddress = async (
  id: string,
  clientId: string,
  data: Partial<ShippingAddressDto>
): Promise<IShippingAddress> => {
  return shippingAddressRepo.update(id, clientId, data);
};

export const deleteAddress = async (id: string, clientId: string): Promise<void> => {
  await shippingAddressRepo.remove(id, clientId);
};

export const setDefaultAddress = async (
  id: string,
  clientId: string
): Promise<IShippingAddress> => {
  return shippingAddressRepo.setDefault(id, clientId);
};

import ShippingAddress, { IShippingAddress } from '@models/ShippingAddress.js';
import { NotFoundError } from '@core/errors/app-error.js';
import { ShippingAddressDto } from './shipping-addresses.validation.js';

export const create = async (
  clientId: string,
  data: ShippingAddressDto
): Promise<IShippingAddress> => {
  const address = await ShippingAddress.create({
    clientId,
    ...data,
  });
  return address;
};

export const findAllByClient = async (clientId: string): Promise<IShippingAddress[]> => {
  return ShippingAddress.find({ clientId }).sort({ isDefault: -1, createdAt: -1 });
};

export const findById = async (id: string, clientId: string): Promise<IShippingAddress> => {
  const address = await ShippingAddress.findOne({ _id: id, clientId });
  if (!address) {
    throw new NotFoundError('Shipping address not found');
  }
  return address;
};

export const update = async (
  id: string,
  clientId: string,
  data: Partial<ShippingAddressDto>
): Promise<IShippingAddress> => {
  const address = await ShippingAddress.findOneAndUpdate(
    { _id: id, clientId },
    { $set: data },
    { new: true, runValidators: true }
  );
  
  if (!address) {
    throw new NotFoundError('Shipping address not found');
  }
  
  return address;
};

export const remove = async (id: string, clientId: string): Promise<void> => {
  const result = await ShippingAddress.deleteOne({ _id: id, clientId });
  if (result.deletedCount === 0) {
    throw new NotFoundError('Shipping address not found');
  }
};

export const setDefault = async (id: string, clientId: string): Promise<IShippingAddress> => {
  // First, unset all defaults for this client
  await ShippingAddress.updateMany(
    { clientId },
    { $set: { isDefault: false } }
  );
  
  // Then set the specified address as default
  const address = await ShippingAddress.findOneAndUpdate(
    { _id: id, clientId },
    { $set: { isDefault: true } },
    { new: true }
  );
  
  if (!address) {
    throw new NotFoundError('Shipping address not found');
  }
  
  return address;
};

import { Location, LocationDocument } from '@models/location.model.js';
import { CreateStoreDto, UpdateStoreDto } from './stores.validation.js';

export const findStoresByRetailer = async (retailerId: string, page: number, limit: number) => {
  const skip = (page - 1) * limit;
  const query = { merchant: retailerId, isDeleted: false };
  const [stores, total] = await Promise.all([
    Location.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    Location.countDocuments(query),
  ]);
  return { stores, total };
};

export const findStoreByIdAndRetailer = (storeId: string, retailerId: string): Promise<LocationDocument | null> =>
  Location.findOne({ _id: storeId, merchant: retailerId, isDeleted: false }).exec();

export const createStore = (retailerId: string, data: CreateStoreDto): Promise<LocationDocument> =>
  new Location({ ...data, merchant: retailerId }).save();

export const updateStore = (storeId: string, data: UpdateStoreDto): Promise<LocationDocument | null> =>
  Location.findByIdAndUpdate(storeId, data, { new: true }).exec();

export const softDeleteStore = (storeId: string): Promise<LocationDocument | null> =>
  Location.findByIdAndUpdate(storeId, { isDeleted: true }, { new: true }).exec();

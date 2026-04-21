import { NotFoundError } from '@core/errors/app-error.js';
import * as storesRepository from './stores.repository.js';
import { CreateStoreDto, UpdateStoreDto } from './stores.validation.js';

const toResponse = (s: any) => ({
  id:            s._id.toString(),
  name:          s.branchAddress,
  address:       s.address,
  state:         s.state,
  country:       s.country,
  branchAddress: s.branchAddress,
  locationType:  s.locationType,
  coordinates:   s.coordinates,
  branchInfo:    s.branchInfo,
  bannerUrl:     s.bannerUrl,
  createdAt:     s.createdAt,
});

export const listStores = async (retailerId: string, page: number, limit: number) => {
  const { stores, total } = await storesRepository.findStoresByRetailer(retailerId, page, limit);
  return { items: stores.map(toResponse), total };
};

export const getStore = async (retailerId: string, storeId: string) => {
  const store = await storesRepository.findStoreByIdAndRetailer(storeId, retailerId);
  if (!store) throw new NotFoundError('Store not found');
  return toResponse(store);
};

export const createStore = async (retailerId: string, dto: CreateStoreDto) => {
  const store = await storesRepository.createStore(retailerId, dto);
  return toResponse(store);
};

export const updateStore = async (retailerId: string, storeId: string, dto: UpdateStoreDto) => {
  const existing = await storesRepository.findStoreByIdAndRetailer(storeId, retailerId);
  if (!existing) throw new NotFoundError('Store not found');
  const updated = await storesRepository.updateStore(storeId, dto);
  if (!updated) throw new NotFoundError('Store not found after update');
  return toResponse(updated);
};

export const deleteStore = async (retailerId: string, storeId: string) => {
  const existing = await storesRepository.findStoreByIdAndRetailer(storeId, retailerId);
  if (!existing) throw new NotFoundError('Store not found');
  await storesRepository.softDeleteStore(storeId);
  return { ok: true };
};

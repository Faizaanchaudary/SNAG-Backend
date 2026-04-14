import * as preferencesRepo from './preferences.repository.js';
import { PreferencesDto } from './preferences.validation.js';
import { IPreferences } from '@models/Preferences.js';

export const getPreferences = async (clientId: string): Promise<IPreferences> => {
  return preferencesRepo.findOrCreate(clientId);
};

export const updatePreferences = async (
  clientId: string,
  data: PreferencesDto
): Promise<IPreferences> => {
  return preferencesRepo.update(clientId, data);
};

import Preferences, { IPreferences } from '@models/Preferences.js';
import { PreferencesDto } from './preferences.validation.js';

export const findOrCreate = async (clientId: string): Promise<IPreferences> => {
  let preferences = await Preferences.findOne({ clientId });
  
  if (!preferences) {
    preferences = await Preferences.create({ clientId });
  }
  
  return preferences;
};

export const update = async (
  clientId: string,
  data: PreferencesDto
): Promise<IPreferences> => {
  const preferences = await Preferences.findOneAndUpdate(
    { clientId },
    { $set: data },
    { new: true, upsert: true, runValidators: true }
  );
  
  return preferences!;
};

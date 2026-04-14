import mongoose, { Schema, Document } from 'mongoose';

export interface IPreferences extends Document {
  clientId: mongoose.Types.ObjectId;
  notifications: {
    email: boolean;
    push: boolean;
    sms: boolean;
  };
  language: string;
  distanceUnit: 'km' | 'miles';
  currency: string;
  privacy: {
    showProfile: boolean;
    shareLocation: boolean;
  };
  updatedAt: Date;
}

const PreferencesSchema = new Schema<IPreferences>(
  {
    clientId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true,
    },
    notifications: {
      email: { type: Boolean, default: true },
      push: { type: Boolean, default: true },
      sms: { type: Boolean, default: false },
    },
    language: {
      type: String,
      default: 'en',
    },
    distanceUnit: {
      type: String,
      enum: ['km', 'miles'],
      default: 'km',
    },
    currency: {
      type: String,
      default: 'USD',
    },
    privacy: {
      showProfile: { type: Boolean, default: true },
      shareLocation: { type: Boolean, default: true },
    },
  },
  {
    timestamps: { createdAt: false, updatedAt: true },
  }
);

export default mongoose.model<IPreferences>('Preferences', PreferencesSchema);

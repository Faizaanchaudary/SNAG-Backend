import mongoose, { Schema, Document } from 'mongoose';

export interface INotification extends Document {
  userId: mongoose.Types.ObjectId;
  userType: 'merchant' | 'client';
  type: 'offer' | 'redemption' | 'system';
  title: string;
  message: string;
  read: boolean;
  metadata?: {
    offerId?: mongoose.Types.ObjectId;
    redemptionId?: mongoose.Types.ObjectId;
    actionUrl?: string;
    [key: string]: any;
  };
  createdAt: Date;
}

const NotificationSchema = new Schema<INotification>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    userType: {
      type: String,
      enum: ['merchant', 'client'],
      required: true,
    },
    type: {
      type: String,
      enum: ['offer', 'redemption', 'system'],
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    message: {
      type: String,
      required: true,
      trim: true,
    },
    read: {
      type: Boolean,
      default: false,
      index: true,
    },
    metadata: {
      type: Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

// Compound indexes for efficient queries
NotificationSchema.index({ userId: 1, read: 1, createdAt: -1 });
NotificationSchema.index({ userId: 1, type: 1, createdAt: -1 });

export default mongoose.model<INotification>('Notification', NotificationSchema);

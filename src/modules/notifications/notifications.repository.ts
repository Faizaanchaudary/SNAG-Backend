import Notification, { INotification } from '@models/Notification.js';
import { NotFoundError } from '@core/errors/app-error.js';
import { NotificationFilterDto } from './notifications.validation.js';

interface PaginatedResult {
  notifications: INotification[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  unreadCount: number;
}

export const create = async (data: {
  userId: string;
  userType: 'merchant' | 'client' | 'retailer';
  type: 'offer' | 'redemption' | 'system' | 'merchant_action';
  title: string;
  message: string;
  metadata?: any;
}): Promise<INotification> => {
  return Notification.create(data);
};

export const findAllByUser = async (
  userId: string,
  filters: NotificationFilterDto
): Promise<PaginatedResult> => {
  const { type, read, page = 1, limit = 20 } = filters;
  
  const query: any = { userId };
  
  if (type && type !== 'all') {
    query.type = type;
  }
  
  if (read !== undefined) {
    query.read = read;
  }
  
  const skip = (page - 1) * limit;
  
  const [notifications, total, unreadCount] = await Promise.all([
    Notification.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean()
      .exec(),
    Notification.countDocuments(query),
    Notification.countDocuments({ userId, read: false }),
  ]);
  
  return {
    notifications: notifications as unknown as INotification[],
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
    unreadCount,
  };
};

export const findById = async (id: string, userId: string): Promise<INotification> => {
  const notification = await Notification.findOne({ _id: id, userId });
  
  if (!notification) {
    throw new NotFoundError('Notification not found');
  }
  
  return notification;
};

export const markAsRead = async (
  id: string,
  userId: string,
  read: boolean
): Promise<INotification> => {
  const notification = await Notification.findOneAndUpdate(
    { _id: id, userId },
    { $set: { read } },
    { new: true }
  );
  
  if (!notification) {
    throw new NotFoundError('Notification not found');
  }
  
  return notification;
};

export const markAllAsRead = async (userId: string): Promise<number> => {
  const result = await Notification.updateMany(
    { userId, read: false },
    { $set: { read: true } }
  );
  
  return result.modifiedCount;
};

export const remove = async (id: string, userId: string): Promise<void> => {
  const result = await Notification.deleteOne({ _id: id, userId });
  
  if (result.deletedCount === 0) {
    throw new NotFoundError('Notification not found');
  }
};

export const getUnreadCount = async (userId: string): Promise<number> => {
  return Notification.countDocuments({ userId, read: false });
};

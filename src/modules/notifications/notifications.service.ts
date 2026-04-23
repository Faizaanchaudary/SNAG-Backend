import * as notificationRepo from './notifications.repository.js';
import { NotificationFilterDto } from './notifications.validation.js';
import { INotification } from '@models/Notification.js';
import { emitNotificationToUser } from '@config/socket.js';

interface PaginatedResult {
  notifications: INotification[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  unreadCount: number;
}

export const getNotifications = async (
  userId: string,
  filters: NotificationFilterDto
): Promise<PaginatedResult> => {
  return notificationRepo.findAllByUser(userId, filters);
};

export const getNotificationById = async (
  id: string,
  userId: string
): Promise<INotification> => {
  return notificationRepo.findById(id, userId);
};

export const markNotificationAsRead = async (
  id: string,
  userId: string,
  read: boolean
): Promise<INotification> => {
  return notificationRepo.markAsRead(id, userId, read);
};

export const markAllNotificationsAsRead = async (userId: string): Promise<number> => {
  return notificationRepo.markAllAsRead(userId);
};

export const deleteNotification = async (id: string, userId: string): Promise<void> => {
  await notificationRepo.remove(id, userId);
};

export const getUnreadCount = async (userId: string): Promise<number> => {
  return notificationRepo.getUnreadCount(userId);
};

// Helper function to create notifications (used by other modules)
export const createNotification = async (data: {
  userId: string;
  userType: 'merchant' | 'client' | 'retailer';
  type: 'offer' | 'redemption' | 'system' | 'merchant_action';
  title: string;
  message: string;
  metadata?: any;
}): Promise<INotification> => {
  const notification = await notificationRepo.create(data);
  
  // Emit Socket.IO event for real-time notification
  try {
    emitNotificationToUser(data.userId, notification);
  } catch (error) {
    // Log error but don't fail notification creation
    console.error('Failed to emit Socket.IO notification:', error);
  }
  
  return notification;
};

import { Request, Response } from 'express';
import * as notificationService from './notifications.service.js';
import { sendSuccess } from '@core/http/response.js';

export const getNotifications = async (req: Request, res: Response): Promise<void> => {
  const result = await notificationService.getNotifications(
    req.user!.id,
    req.query as any
  );
  sendSuccess(res, result);
};

export const getNotificationById = async (req: Request, res: Response): Promise<void> => {
  const notification = await notificationService.getNotificationById(
    req.params['id'] as string,
    req.user!.id
  );
  sendSuccess(res, notification);
};

export const markAsRead = async (req: Request, res: Response): Promise<void> => {
  const notification = await notificationService.markNotificationAsRead(
    req.params['id'] as string,
    req.user!.id,
    true
  );
  sendSuccess(res, notification, 'Notification marked as read');
};

export const markAsUnread = async (req: Request, res: Response): Promise<void> => {
  const notification = await notificationService.markNotificationAsRead(
    req.params['id'] as string,
    req.user!.id,
    false
  );
  sendSuccess(res, notification, 'Notification marked as unread');
};

export const markAllAsRead = async (req: Request, res: Response): Promise<void> => {
  const count = await notificationService.markAllNotificationsAsRead(req.user!.id);
  sendSuccess(res, { modifiedCount: count }, 'All notifications marked as read');
};

export const deleteNotification = async (req: Request, res: Response): Promise<void> => {
  await notificationService.deleteNotification(
    req.params['id'] as string,
    req.user!.id
  );
  sendSuccess(res, null, 'Notification deleted');
};

export const getUnreadCount = async (req: Request, res: Response): Promise<void> => {
  const count = await notificationService.getUnreadCount(req.user!.id);
  sendSuccess(res, { count });
};

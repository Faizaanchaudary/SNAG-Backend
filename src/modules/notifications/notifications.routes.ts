import { Router } from 'express';
import { authenticate } from '@middleware/auth.js';
import { validateQuery } from '@middleware/validation.js';
import * as notificationsController from './notifications.controller.js';
import { notificationFilterSchema } from './notifications.validation.js';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Get all notifications with pagination
router.get(
  '/',
  validateQuery(notificationFilterSchema),
  notificationsController.getNotifications
);

// Get unread count
router.get('/unread-count', notificationsController.getUnreadCount);

// Mark notification as read
router.patch('/:id/read', notificationsController.markAsRead);

// Mark notification as unread
router.patch('/:id/unread', notificationsController.markAsUnread);

// Mark all as read
router.patch('/mark-all-read', notificationsController.markAllAsRead);

// Delete notification
router.delete('/:id', notificationsController.deleteNotification);

export default router;

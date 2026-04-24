import { Server as HTTPServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import { verifyAccessToken } from '@core/auth/jwt.js';
import { config } from './index.js';
import { createSocketIoCorsOptions } from './cors.js';
import { logger } from './logger.js';

let io: SocketIOServer | null = null;

export const initializeSocket = (httpServer: HTTPServer): SocketIOServer => {
  io = new SocketIOServer(httpServer, {
    cors: createSocketIoCorsOptions(config),
  });

  // Authentication middleware
  io.use((socket, next) => {
    try {
      const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.split(' ')[1];
      
      if (!token) {
        return next(new Error('Authentication token required'));
      }

      const user = verifyAccessToken(token);
      socket.data.user = user;
      next();
    } catch (error) {
      next(new Error('Invalid token'));
    }
  });

  // Connection handler
  io.on('connection', (socket) => {
    const userId = socket.data.user.id;
    logger.info({ userId }, 'Client connected to Socket.IO');

    // Join user-specific room
    socket.join(`user:${userId}`);

    // Handle ping for connection health check
    socket.on('ping', () => {
      socket.emit('pong');
    });

    socket.on('disconnect', () => {
      logger.info({ userId }, 'Client disconnected from Socket.IO');
    });

    socket.on('error', (error) => {
      logger.error({ userId, error }, 'Socket.IO error');
    });
  });

  logger.info('Socket.IO initialized');
  return io;
};

export const getIO = (): SocketIOServer => {
  if (!io) {
    throw new Error('Socket.IO not initialized. Call initializeSocket first.');
  }
  return io;
};

// Helper to emit notification to specific user
export const emitNotificationToUser = (userId: string, notification: any): void => {
  try {
    const socketIO = getIO();
    socketIO.to(`user:${userId}`).emit('notification', notification);
    logger.debug({ userId, notificationId: notification._id }, 'Notification emitted via Socket.IO');
  } catch (error) {
    logger.error({ error, userId }, 'Failed to emit notification via Socket.IO');
  }
};

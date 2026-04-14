import { createServer } from 'http';
import app from './app.js';
import { config } from '@config/index.js';
import { logger } from '@config/logger.js';
import { connectDatabase } from '@config/database.js';
import { connectCloudinary } from '@config/cloudinary.js';
import { initializeSocket } from '@config/socket.js';

const start = async (): Promise<void> => {
  // Connect services
  await connectDatabase();
  connectCloudinary();

  // Create HTTP server and initialize Socket.IO
  const httpServer = createServer(app);
  initializeSocket(httpServer);

  // Start HTTP server
  httpServer.listen(config.port, () => {
    logger.info(`Server running on port ${config.port} [${config.nodeEnv}]`);
    logger.info('Socket.IO ready for real-time notifications');
  });

  // Graceful shutdown
  const shutdown = async (signal: string): Promise<void> => {
    logger.info(`${signal} received — shutting down`);
    httpServer.close(async () => {
      const { disconnectDatabase } = await import('@config/database.js');
      await disconnectDatabase();
      process.exit(0);
    });
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));

  // Catch unhandled rejections — log and exit so the process manager restarts
  process.on('unhandledRejection', (reason) => {
    logger.error({ reason }, 'Unhandled rejection');
    process.exit(1);
  });
};

start();

import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import { config } from '@config/index.js';
import { requestLogger } from '@middleware/request-logger.js';
import { errorHandler } from '@middleware/error-handler.js';
import router from './routes/index.js';

const app = express();

// Security
app.use(helmet());
app.use(cors({ origin: config.nodeEnv === 'production' ? false : '*' }));

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Logging
app.use(requestLogger);

// Routes
app.use('/api/v1', router);

// 404
app.use((_req, res) => {
  res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Route not found' } });
});

// Global error handler — must be last
app.use(errorHandler);

export default app;

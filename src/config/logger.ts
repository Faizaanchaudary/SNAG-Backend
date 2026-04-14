import pino from 'pino';
import { config } from './index.js';

export const logger = pino(
  config.nodeEnv === 'development'
    ? {
        level: 'debug',
        transport: {
          target: 'pino-pretty',
          options: { colorize: true, translateTime: 'SYS:standard', ignore: 'pid,hostname' },
        },
      }
    : {
        level: 'info',
      },
);

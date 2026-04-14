import nodemailer from 'nodemailer';
import { config } from './index.js';
import { logger } from './logger.js';

const transporter = nodemailer.createTransport({
  host: config.smtpHost,
  port: config.smtpPort,
  secure: config.smtpPort === 465,
  auth: {
    user: config.smtpUser,
    pass: config.smtpPass,
  },
});

export const sendMail = async (to: string, subject: string, html: string): Promise<void> => {
  await transporter.sendMail({ from: `"SNAG" <${config.smtpUser}>`, to, subject, html });
  logger.info({ to, subject }, 'Email sent');
};

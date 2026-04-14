import mongoose, { Document, Schema } from 'mongoose';

export const SUPPORT_SUBJECTS = [
  'Task Query',
  'Delete Account',
  'Payment Issue',
  'Technical Problem',
  'Other',
] as const;

export interface ISupportTicket {
  client?:       mongoose.Types.ObjectId;
  email:         string;
  phoneNumber:   string;
  subject:       string;
  message:       string;
  attachmentUrl?: string;
  createdAt: Date;
}

export interface SupportTicketDocument extends ISupportTicket, Document {}

const supportTicketSchema = new Schema<SupportTicketDocument>(
  {
    client:        { type: Schema.Types.ObjectId, ref: 'User' },
    email:         { type: String, required: true, trim: true, lowercase: true },
    phoneNumber:   { type: String, required: true, trim: true },
    subject:       { type: String, required: true, trim: true },
    message:       { type: String, required: true, trim: true },
    attachmentUrl: { type: String },
  },
  { timestamps: true },
);

export const SupportTicket = mongoose.model<SupportTicketDocument>('SupportTicket', supportTicketSchema);

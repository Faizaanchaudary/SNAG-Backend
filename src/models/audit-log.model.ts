import mongoose, { Document, Schema } from 'mongoose';

export interface IAuditLog {
  userId: mongoose.Types.ObjectId;
  action: string;
  resource: string;
  resourceId?: string;
  details?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  timestamp: Date;
}

export interface AuditLogDocument extends IAuditLog, Document {}

const auditLogSchema = new Schema<AuditLogDocument>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    action: { type: String, required: true }, // e.g., 'CREATE', 'UPDATE', 'DELETE', 'LOGIN', 'APPROVE'
    resource: { type: String, required: true }, // e.g., 'user', 'retailer', 'deal', 'invite'
    resourceId: { type: String }, // ID of the affected resource
    details: { type: Schema.Types.Mixed }, // Additional context data
    ipAddress: { type: String },
    userAgent: { type: String },
    timestamp: { type: Date, default: Date.now },
  },
  { timestamps: false } // We use custom timestamp field
);

auditLogSchema.index({ userId: 1, timestamp: -1 });
auditLogSchema.index({ resource: 1, timestamp: -1 });
auditLogSchema.index({ action: 1, timestamp: -1 });
auditLogSchema.index({ timestamp: -1 });

export const AuditLog = mongoose.model<AuditLogDocument>('AuditLog', auditLogSchema);
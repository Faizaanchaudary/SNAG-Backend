import mongoose, { Document, Schema } from 'mongoose';

export interface IImportJob {
  type: 'offers' | 'users' | 'retailers';
  status: 'pending' | 'processing' | 'completed' | 'failed';
  createdBy: mongoose.Types.ObjectId;
  totalItems: number;
  processedItems: number;
  successfulItems: number;
  failedItems: number;
  importErrors: Array<{
    row: number;
    field?: string;
    message: string;
  }>;
  metadata: Record<string, any>;
  startedAt?: Date;
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface ImportJobDocument extends IImportJob, Document {}

const importJobSchema = new Schema<ImportJobDocument>(
  {
    type: { 
      type: String, 
      enum: ['offers', 'users', 'retailers'], 
      required: true 
    },
    status: { 
      type: String, 
      enum: ['pending', 'processing', 'completed', 'failed'], 
      default: 'pending' 
    },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    totalItems: { type: Number, default: 0 },
    processedItems: { type: Number, default: 0 },
    successfulItems: { type: Number, default: 0 },
    failedItems: { type: Number, default: 0 },
    importErrors: [{
      row: { type: Number, required: true },
      field: { type: String },
      message: { type: String, required: true },
    }],
    metadata: { type: Schema.Types.Mixed, default: {} },
    startedAt: { type: Date },
    completedAt: { type: Date },
  },
  { timestamps: true }
);

importJobSchema.index({ createdBy: 1, createdAt: -1 });
importJobSchema.index({ status: 1, createdAt: -1 });

export const ImportJob = mongoose.model<ImportJobDocument>('ImportJob', importJobSchema);
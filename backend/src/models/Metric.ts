import mongoose, { Schema, Document, Types } from 'mongoose';

export type MetricType = 'SOIL_MOISTURE' | 'WATER_LEVEL' | 'TEMPERATURE' | 'PH' | 'NITROGEN' | 'STRESS_LEVEL';

export interface IMetric extends Document {
  _id: mongoose.Types.ObjectId;
  type: MetricType;
  value: number;
  region: string;
  recordedAt: Date;
  updatedBy: mongoose.Types.ObjectId; // User who recorded this
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const MetricSchema = new Schema<IMetric>(
  {
    type: {
      type: String,
      enum: ['SOIL_MOISTURE', 'WATER_LEVEL', 'TEMPERATURE', 'PH', 'NITROGEN', 'STRESS_LEVEL'],
      required: true,
    },
    value: {
      type: Number,
      required: true,
    },
    region: {
      type: String,
      required: true,
      trim: true,
    },
    recordedAt: {
      type: Date,
      default: Date.now,
    },
    updatedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    notes: {
      type: String,
      trim: true,
      default: null,
    },
  },
  { timestamps: true }
);

// Index for efficient querying
MetricSchema.index({ region: 1, recordedAt: -1 });
MetricSchema.index({ type: 1, recordedAt: -1 });

export const Metric = mongoose.model<IMetric>('Metric', MetricSchema);

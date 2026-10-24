import mongoose, { Schema, Document, Types } from 'mongoose';

/** Một lần cơ quan quản lý nhập số liệu cho một tỉnh. Bản mới nhất của mỗi tỉnh hiển thị trên bản đồ nông dân. */
export interface IRegionReading extends Document {
  provinceCode: string;
  provinceName: string;
  salinity: number; // ‰
  temperature: number; // °C
  waterLevel: number; // cm ngập
  waterQuality: number; // WQI 0-100
  note?: string;
  isSample: boolean;
  updatedBy?: Types.ObjectId;
  updatedByName?: string;
  createdAt: Date;
}

const RegionReadingSchema = new Schema<IRegionReading>(
  {
    provinceCode: { type: String, required: true, index: true },
    provinceName: { type: String, required: true },
    salinity: { type: Number, required: true, min: 0, max: 40 },
    temperature: { type: Number, required: true, min: 15, max: 50 },
    waterLevel: { type: Number, required: true, min: 0, max: 500 },
    waterQuality: { type: Number, required: true, min: 0, max: 100 },
    note: { type: String, trim: true, maxlength: 500, default: '' },
    isSample: { type: Boolean, default: false },
    updatedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    updatedByName: { type: String },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

RegionReadingSchema.index({ provinceCode: 1, createdAt: -1 });

export const RegionReading = mongoose.model<IRegionReading>('RegionReading', RegionReadingSchema);

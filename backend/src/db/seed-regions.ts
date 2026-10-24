/**
 * Nạp số liệu MẪU cho 13 tỉnh ĐBSCL để bản đồ nông dân có dữ liệu khi demo.
 * Chạy:  npm run seed:regions
 * Số liệu mẫu được gắn nhãn "Số liệu mẫu" và sẽ được thay thế ngay khi cơ quan quản lý nhập số liệu thật.
 */
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { RegionReading } from '../models/RegionReading';
import { MEKONG_REGIONS } from '../config/regions';

dotenv.config();

const SAMPLE: Record<string, [number, number, number, number]> = {
  // [độ mặn ‰, nhiệt độ °C, mức ngập cm, WQI]
  LA: [0.8, 34, 5, 72],
  TG: [2.1, 34, 8, 68],
  BT: [3.4, 33, 6, 65],
  TV: [4.2, 34, 10, 60],
  VL: [0.6, 33, 15, 74],
  DT: [0.3, 33, 35, 78],
  AG: [0.2, 34, 42, 80],
  KG: [2.6, 35, 20, 66],
  CT: [0.5, 34, 22, 73],
  HG: [0.9, 34, 18, 71],
  ST: [5.1, 35, 12, 55],
  BL: [6.3, 35, 9, 52],
  CM: [7.2, 35, 14, 48],
};

(async () => {
  await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/agritech_db');
  await RegionReading.deleteMany({ isSample: true });
  const docs = MEKONG_REGIONS.map((r) => {
    const [salinity, temperature, waterLevel, waterQuality] = SAMPLE[r.code];
    return { provinceCode: r.code, provinceName: r.name, salinity, temperature, waterLevel, waterQuality, isSample: true, updatedByName: 'Số liệu mẫu' };
  });
  await RegionReading.insertMany(docs);
  console.log(`✅ Đã nạp ${docs.length} bản ghi số liệu mẫu`);
  await mongoose.disconnect();
})().catch((e) => {
  console.error(e);
  process.exit(1);
});

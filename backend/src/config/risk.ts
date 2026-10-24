/**
 * Ngưỡng đánh giá mức độ rủi ro. PHẢI khớp với src/lib/risk.ts ở frontend.
 * low < moderate < high < extreme
 */
export type RiskLevel = 'low' | 'moderate' | 'high' | 'extreme';

export const LEVEL_LABEL: Record<RiskLevel, string> = {
  low: 'Thấp',
  moderate: 'Trung bình',
  high: 'Cao',
  extreme: 'Rất cao',
};

const ORDER: RiskLevel[] = ['low', 'moderate', 'high', 'extreme'];

/** Độ mặn (‰): dưới 1 an toàn, từ 4 trở lên lúa bị thiệt hại nặng */
export const salinityLevel = (v: number): RiskLevel => (v >= 8 ? 'extreme' : v >= 4 ? 'high' : v >= 1 ? 'moderate' : 'low');
/** Nhiệt độ không khí cao nhất (°C) theo các cấp nắng nóng */
export const temperatureLevel = (v: number): RiskLevel => (v >= 39 ? 'extreme' : v >= 37 ? 'high' : v >= 35 ? 'moderate' : 'low');
/** Độ sâu ngập (cm) */
export const floodLevel = (v: number): RiskLevel => (v >= 60 ? 'extreme' : v >= 30 ? 'high' : v >= 10 ? 'moderate' : 'low');
/** Chỉ số chất lượng nước WQI (0-100, càng cao càng tốt) */
export const waterQualityLevel = (v: number): RiskLevel => (v < 26 ? 'extreme' : v < 51 ? 'high' : v < 76 ? 'moderate' : 'low');

export function overallLevel(r: { salinity: number; temperature: number; waterLevel: number; waterQuality: number }): RiskLevel {
  const levels = [salinityLevel(r.salinity), temperatureLevel(r.temperature), floodLevel(r.waterLevel), waterQualityLevel(r.waterQuality)];
  return levels.reduce((max, l) => (ORDER.indexOf(l) > ORDER.indexOf(max) ? l : max), 'low' as RiskLevel);
}

const fmt = (n: number) => String(Math.round(n * 10) / 10).replace('.', ',');

/** Nội dung thông báo tự động gửi nông dân khi cơ quan quản lý cập nhật số liệu */
export function describeReading(provinceName: string, r: { salinity: number; temperature: number; waterLevel: number; waterQuality: number; note?: string }) {
  const overall = overallLevel(r);
  const parts = [
    `Độ mặn ${fmt(r.salinity)}‰ (${LEVEL_LABEL[salinityLevel(r.salinity)]})`,
    `nhiệt độ ${fmt(r.temperature)}°C (${LEVEL_LABEL[temperatureLevel(r.temperature)]})`,
    `mức ngập ${fmt(r.waterLevel)} cm (${LEVEL_LABEL[floodLevel(r.waterLevel)]})`,
    `chất lượng nước WQI ${fmt(r.waterQuality)} (${LEVEL_LABEL[waterQualityLevel(r.waterQuality)]})`,
  ];
  const advice: string[] = [];
  if (salinityLevel(r.salinity) === 'high' || salinityLevel(r.salinity) === 'extreme') advice.push('đóng cống ngăn mặn, chỉ lấy nước khi độ mặn xuống dưới 1‰, ưu tiên trữ nước ngọt');
  if (temperatureLevel(r.temperature) === 'high' || temperatureLevel(r.temperature) === 'extreme') advice.push('tưới vào sáng sớm hoặc chiều mát, che nắng cho cây non và vật nuôi');
  if (floodLevel(r.waterLevel) === 'high' || floodLevel(r.waterLevel) === 'extreme') advice.push('kiểm tra bờ bao, chuẩn bị bơm tiêu, thu hoạch sớm phần đã chín');
  if (waterQualityLevel(r.waterQuality) === 'high' || waterQualityLevel(r.waterQuality) === 'extreme') advice.push('tạm ngừng lấy nước từ nguồn bị ô nhiễm cho ao nuôi và ruộng');

  let text = `${provinceName}: ${parts.join('; ')}. Mức rủi ro tổng hợp: ${LEVEL_LABEL[overall]}.`;
  if (advice.length) text += ` Khuyến cáo: ${advice.join('; ')}.`;
  if (r.note) text += ` Ghi chú của cơ quan quản lý: ${r.note}`;
  return { overall, text };
}

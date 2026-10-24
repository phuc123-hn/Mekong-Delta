import type { RegionReading } from '@/data/mekong-regions';

/** Ngưỡng đánh giá rủi ro. PHẢI khớp với backend/src/config/risk.ts */
export type RiskLevel = 'low' | 'moderate' | 'high' | 'extreme';
export type MetricKey = 'salinity' | 'temperature' | 'waterLevel' | 'waterQuality';

export const LEVEL_ORDER: RiskLevel[] = ['low', 'moderate', 'high', 'extreme'];

export const LEVEL_META: Record<RiskLevel, { label: string; color: string; badge: string; bar: string }> = {
  low: { label: 'Thấp', color: '#10b981', badge: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30', bar: 'bg-emerald-500' },
  moderate: { label: 'Trung bình', color: '#eab308', badge: 'bg-yellow-500/15 text-yellow-300 border-yellow-500/30', bar: 'bg-yellow-500' },
  high: { label: 'Cao', color: '#f97316', badge: 'bg-orange-500/15 text-orange-300 border-orange-500/30', bar: 'bg-orange-500' },
  extreme: { label: 'Rất cao', color: '#ef4444', badge: 'bg-red-500/15 text-red-300 border-red-500/30', bar: 'bg-red-500' },
};

export interface MetricSpec {
  key: MetricKey;
  label: string;
  short: string;
  unit: string;
  min: number;
  max: number;
  step: number;
  level: (v: number) => RiskLevel;
  /** Giải thích ngắn cho người dùng */
  help: string;
  /** Mô tả các ngưỡng */
  thresholds: string;
}

export const salinityLevel = (v: number): RiskLevel => (v >= 8 ? 'extreme' : v >= 4 ? 'high' : v >= 1 ? 'moderate' : 'low');
export const temperatureLevel = (v: number): RiskLevel => (v >= 39 ? 'extreme' : v >= 37 ? 'high' : v >= 35 ? 'moderate' : 'low');
export const floodLevel = (v: number): RiskLevel => (v >= 60 ? 'extreme' : v >= 30 ? 'high' : v >= 10 ? 'moderate' : 'low');
export const waterQualityLevel = (v: number): RiskLevel => (v < 26 ? 'extreme' : v < 51 ? 'high' : v < 76 ? 'moderate' : 'low');

export const METRICS: MetricSpec[] = [
  {
    key: 'salinity', label: 'Độ mặn', short: 'Mặn', unit: '‰', min: 0, max: 40, step: 0.1, level: salinityLevel,
    help: 'Nồng độ muối trong nước kênh, rạch. 1‰ tương đương 1 gam muối trong 1 lít nước.',
    thresholds: 'Dưới 1‰ an toàn; từ 1‰ cần theo dõi; từ 4‰ lúa có thể thiệt hại nặng; từ 8‰ rất nguy hiểm.',
  },
  {
    key: 'temperature', label: 'Nhiệt độ', short: 'Nhiệt', unit: '°C', min: 15, max: 50, step: 0.1, level: temperatureLevel,
    help: 'Nhiệt độ không khí cao nhất trong ngày, ảnh hưởng đến cây trồng, ao nuôi và vật nuôi.',
    thresholds: 'Dưới 35°C bình thường; từ 35°C nắng nóng; từ 37°C gay gắt; từ 39°C đặc biệt gay gắt.',
  },
  {
    key: 'waterLevel', label: 'Mức ngập', short: 'Lũ', unit: 'cm', min: 0, max: 500, step: 1, level: floodLevel,
    help: 'Độ sâu nước ngập trên ruộng, vườn hoặc đường tại khu vực quan trắc.',
    thresholds: 'Dưới 10 cm gần như không ảnh hưởng; từ 10 cm cần theo dõi; từ 30 cm gây hại hoa màu; từ 60 cm rất nguy hiểm.',
  },
  {
    key: 'waterQuality', label: 'Chất lượng nước (WQI)', short: 'Ô nhiễm', unit: '', min: 0, max: 100, step: 1, level: waterQualityLevel,
    help: 'Chỉ số chất lượng nước từ 0 đến 100. Điểm càng cao thì nước càng sạch.',
    thresholds: 'Từ 76 điểm trở lên tốt; 51 đến 75 trung bình; 26 đến 50 kém; dưới 26 ô nhiễm nặng.',
  },
];

export const metricByKey = (k: MetricKey) => METRICS.find((m) => m.key === k)!;

type ReadingValues = Pick<RegionReading, 'salinity' | 'temperature' | 'waterLevel' | 'waterQuality'>;

export const worst = (levels: RiskLevel[]): RiskLevel =>
  levels.reduce((m, l) => (LEVEL_ORDER.indexOf(l) > LEVEL_ORDER.indexOf(m) ? l : m), 'low' as RiskLevel);

export function assess(r: ReadingValues) {
  const per = Object.fromEntries(METRICS.map((m) => [m.key, m.level(r[m.key])])) as Record<MetricKey, RiskLevel>;
  return { per, overall: worst(Object.values(per)) };
}

export const formatValue = (v: number, unit: string) => `${String(Math.round(v * 10) / 10).replace('.', ',')}${unit ? (unit === '‰' || unit === '°C' ? unit : ' ' + unit) : ''}`;

/** Khuyến cáo ngắn gọn theo từng chỉ số đang ở mức cao */
export function adviceFor(r: ReadingValues): string[] {
  const { per } = assess(r);
  const hi = (l: RiskLevel) => l === 'high' || l === 'extreme';
  const out: string[] = [];
  if (hi(per.salinity)) out.push('Đóng cống ngăn mặn, chỉ lấy nước khi độ mặn xuống dưới 1‰ và ưu tiên trữ nước ngọt.');
  else if (per.salinity === 'moderate') out.push('Đo độ mặn trước mỗi lần lấy nước, tránh lấy nước lúc triều cao.');
  if (hi(per.temperature)) out.push('Tưới vào sáng sớm hoặc chiều mát, che nắng cho cây non và vật nuôi, tăng sục khí cho ao nuôi.');
  if (hi(per.waterLevel)) out.push('Kiểm tra bờ bao, chuẩn bị máy bơm tiêu úng, thu hoạch sớm phần đã chín.');
  else if (per.waterLevel === 'moderate') out.push('Theo dõi mực nước hằng ngày, dọn thông các mương thoát nước.');
  if (hi(per.waterQuality)) out.push('Tạm ngừng lấy nước từ nguồn có nguy cơ ô nhiễm cho ao nuôi, ruộng và sinh hoạt.');
  if (!out.length) out.push('Các chỉ số đang ở mức an toàn. Tiếp tục theo dõi cập nhật mới.');
  return out;
}

export function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'Vừa xong';
  if (m < 60) return `${m} phút trước`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} giờ trước`;
  const d = Math.floor(h / 24);
  if (d < 7) return `${d} ngày trước`;
  return new Date(iso).toLocaleDateString('vi-VN');
}

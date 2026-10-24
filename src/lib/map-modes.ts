import type { RegionReading } from '@/data/mekong-regions';
import { METRICS, assess, MetricKey, RiskLevel } from '@/lib/risk';

/** Chế độ tô màu trên bản đồ: mức tổng hợp hoặc từng chỉ số riêng */
export type MapMode = 'overall' | MetricKey;

export const MODE_OPTIONS: { value: MapMode; label: string }[] = [
  { value: 'overall', label: 'Tổng hợp' },
  ...METRICS.map((m) => ({ value: m.key as MapMode, label: m.short })),
];

export function levelFor(reading: RegionReading | undefined, mode: MapMode): RiskLevel | null {
  if (!reading) return null;
  const a = assess(reading);
  return mode === 'overall' ? a.overall : a.per[mode];
}

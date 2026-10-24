'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import api, { explainApiError, ApiErrorInfo } from '@/lib/api';
import { useRealtime } from '@/lib/realtime';
import { MEKONG_REGIONS, Region, RegionReading } from '@/data/mekong-regions';

/**
 * Số liệu mới nhất của 13 tỉnh ĐBSCL do cơ quan quản lý nhập.
 * Tự cập nhật ngay khi có nhập liệu mới (Socket.io) và tải lại mỗi 60 giây phòng khi mất kết nối realtime.
 */
export function useRegionData() {
  const [regions, setRegions] = useState<Region[]>(MEKONG_REGIONS);
  const [readings, setReadings] = useState<RegionReading[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<ApiErrorInfo | null>(null);
  const [loadedAt, setLoadedAt] = useState<Date | null>(null);

  const load = useCallback(async () => {
    try {
      const res = await api.get('/api/data/regions');
      setRegions(res.data.regions?.length ? res.data.regions : MEKONG_REGIONS);
      setReadings(res.data.readings || []);
      setError(null);
      setLoadedAt(new Date());
    } catch (e) {
      setError(await explainApiError(e));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
    const t = setInterval(load, 60000);
    return () => clearInterval(t);
  }, [load]);

  useRealtime({ region_update: () => load() });

  const byCode = useMemo(() => new Map(readings.map((r) => [r.provinceCode, r])), [readings]);
  return { regions, readings, byCode, loading, error, loadedAt, reload: load };
}

'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { useAuthStore } from '@/store/auth-store';
import { useRegionData } from '@/hooks/use-region-data';
import { regionName } from '@/data/mekong-regions';
import { LEVEL_META, METRICS, assess, formatValue, timeAgo } from '@/lib/risk';
import AnnouncementCard, { Announcement } from '@/components/announcement-card';
import { Alert, LoadingBlock, PageHeader } from '@/components/ui';

export default function DashboardOverview() {
  const user = useAuthStore((s) => s.user);
  const { regions, byCode, readings, loading, error, reload, loadedAt } = useRegionData();
  const [latest, setLatest] = useState<Announcement[]>([]);

  useEffect(() => {
    api.get('/api/messages/announcements').then((r) => setLatest((r.data.announcements || []).slice(0, 3))).catch(() => undefined);
  }, []);

  const rows = regions.map((r) => ({ region: r, reading: byCode.get(r.code) }));
  const withData = rows.filter((r) => r.reading);
  const atRisk = withData.filter((r) => ['high', 'extreme'].includes(assess(r.reading!).overall));
  const mine = user?.region ? byCode.get(user.region) : undefined;
  const mineAssess = mine ? assess(mine) : null;
  const newest = readings.reduce<string | null>((n, r) => (!n || r.updatedAt > n ? r.updatedAt : n), null);

  return (
    <div className="page">
      <PageHeader
        title={`Xin chào, ${user?.fullName || 'bà con'}`}
        subtitle={user?.region ? `Tỉnh của bạn: ${regionName(user.region)}. Số liệu do cơ quan quản lý cập nhật.` : 'Tổng hợp rủi ro mặn, nhiệt, lũ và ô nhiễm nước của 13 tỉnh, thành.'}
        actions={<Link href="/dashboard/stress-map" className="btn btn-primary">Mở bản đồ rủi ro</Link>}
      />

      {error && <div className="mb-5"><Alert kind="error" title="Không tải được số liệu mới nhất" action={<button className="btn btn-secondary px-3 py-1" onClick={reload}>Thử lại</button>}>{error.message}</Alert></div>}

      {loading ? <LoadingBlock /> : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              ['Tỉnh có số liệu', `${withData.length}/${regions.length}`, 'đã được cơ quan quản lý cập nhật'],
              ['Tỉnh rủi ro cao', String(atRisk.length), atRisk.length ? atRisk.slice(0, 3).map((r) => r.region.name).join(', ') + (atRisk.length > 3 ? '...' : '') : 'chưa có tỉnh nào ở mức cao'],
              ['Tỉnh của bạn', mineAssess ? LEVEL_META[mineAssess.overall].label : '-', user?.region ? (mine ? `cập nhật ${timeAgo(mine.updatedAt)}` : 'chưa có số liệu') : 'chưa được gán tỉnh'],
              ['Cập nhật gần nhất', newest ? timeAgo(newest) : '-', loadedAt ? `tải lúc ${loadedAt.toLocaleTimeString('vi-VN')}` : ''],
            ].map(([label, value, sub]) => (
              <div key={label} className="card p-5">
                <p className="text-sm text-slate-400">{label}</p>
                <p className="mt-2 text-3xl font-bold text-white">{value}</p>
                <p className="mt-1 text-xs text-slate-500">{sub}</p>
              </div>
            ))}
          </div>

          <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
            <section>
              <div className="mb-3 flex items-center justify-between">
                <h2 className="text-lg font-bold text-white">Mức rủi ro các tỉnh</h2>
                <Link href="/dashboard/stress-map" className="text-sm text-cyan-300 hover:text-cyan-200">Xem trên bản đồ</Link>
              </div>
              <div className="card divide-y divide-slate-800">
                {[...rows]
                  .sort((a, b) => (b.reading ? ['low', 'moderate', 'high', 'extreme'].indexOf(assess(b.reading).overall) : -1) - (a.reading ? ['low', 'moderate', 'high', 'extreme'].indexOf(assess(a.reading).overall) : -1))
                  .map(({ region, reading }) => {
                    const a = reading ? assess(reading) : null;
                    return (
                      <div key={region.code} className="flex items-center justify-between gap-3 px-4 py-3">
                        <div className="min-w-0">
                          <p className="font-medium text-white">{region.name}</p>
                          <p className="truncate text-xs text-slate-400">
                            {reading ? METRICS.map((m) => `${m.short} ${formatValue(reading[m.key], m.unit)}`).join(' · ') : 'Chưa có số liệu'}
                          </p>
                        </div>
                        {a ? <span className={`badge shrink-0 ${LEVEL_META[a.overall].badge}`}>{LEVEL_META[a.overall].label}</span> : <span className="text-xs text-slate-500">Chưa có</span>}
                      </div>
                    );
                  })}
              </div>
            </section>

            <section>
              <div className="mb-3 flex items-center justify-between">
                <h2 className="text-lg font-bold text-white">Thông báo mới nhất</h2>
                <Link href="/dashboard/inbox" className="text-sm text-cyan-300 hover:text-cyan-200">Xem tất cả</Link>
              </div>
              {latest.length === 0 ? (
                <div className="card p-6 text-sm text-slate-400">Chưa có thông báo nào từ cơ quan quản lý.</div>
              ) : (
                <div className="space-y-3">{latest.map((a) => <AnnouncementCard key={a.id} a={a} />)}</div>
              )}
            </section>
          </div>

          <section className="mt-10">
            <h2 className="text-lg font-bold text-white">Cách đọc bốn chỉ số</h2>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              {METRICS.map((m) => (
                <div key={m.key} className="card p-5">
                  <h3 className="font-bold text-white">{m.label}{m.unit ? ` (${m.unit})` : ''}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-slate-300">{m.help}</p>
                  <p className="mt-2 text-sm leading-relaxed text-slate-400">{m.thresholds}</p>
                </div>
              ))}
            </div>
            <p className="mt-4 text-sm text-slate-400">
              Mức tổng hợp của mỗi tỉnh là mức cao nhất trong bốn chỉ số. Tìm hiểu thêm trong mục <Link href="/dashboard/knowledge" className="text-cyan-300 hover:text-cyan-200">Kiến thức</Link>.
            </p>
          </section>
        </>
      )}
    </div>
  );
}

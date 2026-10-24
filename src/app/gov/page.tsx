'use client';

import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import api, { explainApiError } from '@/lib/api';
import { useAuthStore } from '@/store/auth-store';
import { useRegionData } from '@/hooks/use-region-data';
import { useRealtime } from '@/lib/realtime';
import { LEVEL_META, assess, timeAgo } from '@/lib/risk';
import { Alert, LoadingBlock, PageHeader } from '@/components/ui';

interface Summary {
  farmers: number;
  governments: number;
  unreadChats: number;
  provincesWithData: number;
  totalProvinces: number;
  provincesAtRisk: number;
}

const STALE_HOURS = 48;

export default function GovHomePage() {
  const user = useAuthStore((s) => s.user);
  const { regions, byCode, loading: regionsLoading } = useRegionData();
  const [summary, setSummary] = useState<Summary | null>(null);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    try {
      const res = await api.get('/api/data/summary');
      setSummary(res.data);
      setError('');
    } catch (e) {
      setError((await explainApiError(e)).message);
    }
  }, []);

  useEffect(() => {
    load();
    const t = setInterval(load, 30000);
    return () => clearInterval(t);
  }, [load]);
  useRealtime({ chat_message: () => load(), region_update: () => load() });

  // Tỉnh cần nhập liệu: chưa có số liệu hoặc số liệu đã cũ
  const needs = regions
    .map((r) => ({ r, d: byCode.get(r.code) }))
    .filter(({ d }) => !d || Date.now() - new Date(d.updatedAt).getTime() > STALE_HOURS * 3600 * 1000 || d.isSample);

  const cards = summary
    ? [
        ['Nông dân', summary.farmers, 'tài khoản đã đăng ký', '/gov/users'],
        ['Tin nhắn chưa đọc', summary.unreadChats, 'từ nông dân', '/gov/inbox'],
        ['Tỉnh có số liệu', `${summary.provincesWithData}/${summary.totalProvinces}`, 'đã nhập số liệu', '/gov/input'],
        ['Tỉnh rủi ro cao', summary.provincesAtRisk, 'cần ưu tiên theo dõi', '/gov/input'],
      ]
    : [];

  return (
    <div className="page">
      <PageHeader title={`Xin chào, ${user?.fullName || 'cán bộ'}`} subtitle="Tổng quan hoạt động của hệ thống Delta Stress Lens." actions={<Link href="/gov/input" className="btn btn-primary">Nhập số liệu</Link>} />
      {error && <div className="mb-5"><Alert kind="error" action={<button className="btn btn-secondary px-3 py-1" onClick={load}>Thử lại</button>}>{error}</Alert></div>}

      {!summary && !error ? <LoadingBlock /> : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {cards.map(([label, value, sub, href]) => (
            <Link key={String(label)} href={String(href)} className="card p-5 transition-colors hover:border-cyan-600">
              <p className="text-sm text-slate-400">{label}</p>
              <p className="mt-2 text-3xl font-bold text-white">{value}</p>
              <p className="mt-1 text-xs text-slate-500">{sub}</p>
            </Link>
          ))}
        </div>
      )}

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <section>
          <h2 className="mb-3 text-lg font-bold text-white">Tỉnh cần cập nhật số liệu</h2>
          {regionsLoading ? <LoadingBlock /> : needs.length === 0 ? (
            <div className="card p-6 text-sm text-emerald-300">Tất cả 13 tỉnh đều có số liệu cập nhật trong vòng {STALE_HOURS} giờ.</div>
          ) : (
            <div className="card divide-y divide-slate-800">
              {needs.map(({ r, d }) => (
                <Link key={r.code} href="/gov/input" className="flex items-center justify-between gap-3 px-4 py-3 hover:bg-slate-800/60">
                  <span className="font-medium text-white">{r.name}</span>
                  <span className="text-xs text-yellow-300">{!d ? 'Chưa có số liệu' : d.isSample ? 'Đang dùng số liệu mẫu' : `Cập nhật ${timeAgo(d.updatedAt)}`}</span>
                </Link>
              ))}
            </div>
          )}
        </section>

        <section>
          <h2 className="mb-3 text-lg font-bold text-white">Các tỉnh theo mức rủi ro</h2>
          <div className="card divide-y divide-slate-800">
            {regions
              .map((r) => ({ r, a: byCode.get(r.code) ? assess(byCode.get(r.code)!) : null }))
              .filter((x) => x.a && (x.a.overall === 'high' || x.a.overall === 'extreme'))
              .map(({ r, a }) => (
                <div key={r.code} className="flex items-center justify-between px-4 py-3">
                  <span className="font-medium text-white">{r.name}</span>
                  <span className={`badge ${LEVEL_META[a!.overall].badge}`}>{LEVEL_META[a!.overall].label}</span>
                </div>
              ))}
            {regions.every((r) => !byCode.get(r.code) || !['high', 'extreme'].includes(assess(byCode.get(r.code)!).overall)) && (
              <p className="p-6 text-sm text-slate-400">Chưa có tỉnh nào ở mức cao trở lên.</p>
            )}
          </div>
        </section>
      </div>

      <section className="mt-10 grid gap-4 md:grid-cols-3">
        {[
          ['Nhập liệu theo tỉnh', 'Cập nhật mặn, nhiệt, ngập, chất lượng nước. Nông dân thấy ngay trên bản đồ.', '/gov/input'],
          ['Hộp thoại', 'Trả lời câu hỏi của từng nông dân.', '/gov/inbox'],
          ['Tin nhắn chung', 'Phát hành cảnh báo đến toàn vùng hoặc từng tỉnh.', '/gov/announcements'],
        ].map(([t, d, h]) => (
          <Link key={t} href={h} className="card p-5 transition-colors hover:border-cyan-600">
            <h3 className="font-bold text-white">{t}</h3>
            <p className="mt-1 text-sm leading-relaxed text-slate-400">{d}</p>
          </Link>
        ))}
      </section>
    </div>
  );
}

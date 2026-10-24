'use client';

import dynamic from 'next/dynamic';
import { useMemo, useState } from 'react';
import { useRegionData } from '@/hooks/use-region-data';
import { useAuthStore } from '@/store/auth-store';
import { Alert, Spinner } from '@/components/ui';
import { LEVEL_META, METRICS, adviceFor, assess, formatValue, timeAgo } from '@/lib/risk';
import { MODE_OPTIONS, levelFor, MapMode } from '@/lib/map-modes';

// Leaflet chỉ chạy ở trình duyệt; tải động để không lỗi khi render phía máy chủ
const RiskMap = dynamic(() => import('@/components/risk-map'), {
  ssr: false,
  loading: () => (
    <div className="flex h-full items-center justify-center gap-3 bg-slate-900 text-slate-400">
      <Spinner /> Đang tải bản đồ...
    </div>
  ),
});

export default function StressMapPage() {
  const { user } = useAuthStore();
  const { regions, byCode, readings, loading, error, reload } = useRegionData();
  const [mode, setMode] = useState<MapMode>('overall');
  const [selected, setSelected] = useState<string | null>(user?.region ?? null);

  const sel = selected ? byCode.get(selected) : undefined;
  const selRegion = regions.find((r) => r.code === selected);
  const selAssess = sel ? assess(sel) : null;

  // Xếp hạng: rủi ro cao lên đầu
  const ranking = useMemo(
    () =>
      regions
        .map((r) => ({ region: r, reading: byCode.get(r.code), level: levelFor(byCode.get(r.code), mode) }))
        .sort((a, b) => (b.level ? ['low', 'moderate', 'high', 'extreme'].indexOf(b.level) : -1) - (a.level ? ['low', 'moderate', 'high', 'extreme'].indexOf(a.level) : -1)),
    [regions, byCode, mode]
  );

  return (
    <div className="flex h-[calc(100vh-3.5rem)] flex-col lg:flex-row">
      {/* ============ BẢN ĐỒ ============ */}
      <div className="relative h-[55vh] min-h-[320px] flex-1 lg:h-auto">
        <RiskMap regions={regions} byCode={byCode} mode={mode} selected={selected} onSelect={setSelected} />

        {/* Chọn chỉ số hiển thị */}
        <div className="absolute left-3 top-3 z-[500] flex flex-wrap gap-1 rounded-lg border border-slate-700 bg-slate-900/95 p-1 shadow-xl">
          {MODE_OPTIONS.map((o) => (
            <button
              key={o.value}
              onClick={() => setMode(o.value)}
              className={`rounded-md px-3 py-1.5 text-xs font-semibold transition-colors ${mode === o.value ? 'bg-cyan-600 text-white' : 'text-slate-300 hover:bg-slate-800'}`}
            >
              {o.label}
            </button>
          ))}
        </div>

        {/* Chú giải */}
        <div className="absolute bottom-3 left-3 z-[500] rounded-lg border border-slate-700 bg-slate-900/95 p-3 text-xs shadow-xl">
          <p className="mb-1.5 font-semibold text-slate-200">Mức rủi ro</p>
          <ul className="space-y-1">
            {(Object.keys(LEVEL_META) as (keyof typeof LEVEL_META)[]).map((k) => (
              <li key={k} className="flex items-center gap-2 text-slate-300">
                <span className="inline-block h-3 w-3 rounded-full" style={{ background: LEVEL_META[k].color }} />
                {LEVEL_META[k].label}
              </li>
            ))}
            <li className="flex items-center gap-2 text-slate-400">
              <span className="inline-block h-3 w-3 rounded-full bg-slate-500" />
              Chưa có số liệu
            </li>
          </ul>
        </div>

        {error && (
          <div className="absolute inset-x-3 top-14 z-[500] mx-auto max-w-xl">
            <Alert kind="error" title="Không tải được số liệu mới nhất" action={<button onClick={reload} className="btn btn-secondary px-3 py-1">Thử lại</button>}>
              {error.message}
            </Alert>
          </div>
        )}
      </div>

      {/* ============ THANH BÊN: CHI TIẾT TỈNH + XẾP HẠNG (cuộn được) ============ */}
      <aside className="h-[45vh] w-full shrink-0 overflow-y-auto border-t border-slate-800 bg-slate-900 lg:h-auto lg:w-[380px] lg:border-l lg:border-t-0">
        {selRegion ? (
          <div className="border-b border-slate-800 p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-xl font-bold text-white">{selRegion.name}</h2>
                {sel ? (
                  <p className="mt-1 text-xs text-slate-400">
                    Cập nhật {timeAgo(sel.updatedAt)}
                    {sel.updatedByName && !sel.isSample ? ` bởi ${sel.updatedByName}` : ''}
                  </p>
                ) : (
                  <p className="mt-1 text-xs text-slate-400">Cơ quan quản lý chưa nhập số liệu cho tỉnh này.</p>
                )}
              </div>
              <button onClick={() => setSelected(null)} className="btn btn-ghost px-2 py-1 text-xs">
                Bỏ chọn
              </button>
            </div>

            {sel && selAssess && (
              <>
                <div className="mt-3 flex items-center gap-2">
                  <span className={`badge ${LEVEL_META[selAssess.overall].badge}`}>Rủi ro tổng hợp: {LEVEL_META[selAssess.overall].label}</span>
                  {sel.isSample && <span className="badge border-slate-600 bg-slate-800 text-slate-300">Số liệu mẫu</span>}
                </div>

                <dl className="mt-4 grid grid-cols-2 gap-3">
                  {METRICS.map((m) => {
                    const lv = selAssess.per[m.key];
                    return (
                      <div key={m.key} className="rounded-lg border border-slate-800 bg-slate-950 p-3">
                        <dt className="text-xs text-slate-400">{m.label}</dt>
                        <dd className="mt-1 text-xl font-bold text-white">{formatValue(sel[m.key], m.unit)}</dd>
                        <span className={`badge mt-2 ${LEVEL_META[lv].badge}`}>{LEVEL_META[lv].label}</span>
                      </div>
                    );
                  })}
                </dl>

                {sel.note && (
                  <div className="mt-4 rounded-lg border border-slate-800 bg-slate-950 p-3 text-sm">
                    <p className="text-xs font-semibold text-slate-400">Ghi chú của cơ quan quản lý</p>
                    <p className="mt-1 leading-relaxed text-slate-200">{sel.note}</p>
                  </div>
                )}

                <div className="mt-4">
                  <p className="text-sm font-semibold text-white">Khuyến cáo</p>
                  <ul className="mt-2 list-disc space-y-1.5 pl-5 text-sm leading-relaxed text-slate-300 marker:text-cyan-500">
                    {adviceFor(sel).map((t) => (
                      <li key={t}>{t}</li>
                    ))}
                  </ul>
                </div>
              </>
            )}
          </div>
        ) : (
          <div className="border-b border-slate-800 p-5">
            <h2 className="text-lg font-bold text-white">Chọn một tỉnh trên bản đồ</h2>
            <p className="mt-1 text-sm leading-relaxed text-slate-400">Nhấn vào chấm tròn hoặc chọn trong danh sách bên dưới để xem số liệu do cơ quan quản lý cập nhật, kèm khuyến cáo.</p>
          </div>
        )}

        <div className="p-5">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-white">Xếp hạng 13 tỉnh, thành</h3>
            <span className="text-xs text-slate-400">{readings.length}/{regions.length} có số liệu</span>
          </div>
          {loading ? (
            <div className="flex justify-center py-8"><Spinner /></div>
          ) : (
            <ul className="mt-3 divide-y divide-slate-800 rounded-lg border border-slate-800">
              {ranking.map(({ region, reading, level }) => (
                <li key={region.code}>
                  <button
                    onClick={() => setSelected(region.code)}
                    className={`flex w-full items-center justify-between px-3 py-2.5 text-left text-sm transition-colors hover:bg-slate-800 ${selected === region.code ? 'bg-slate-800' : ''}`}
                  >
                    <span className="font-medium text-slate-100">{region.name}</span>
                    {level ? <span className={`badge ${LEVEL_META[level].badge}`}>{LEVEL_META[level].label}</span> : <span className="text-xs text-slate-500">Chưa có số liệu</span>}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </aside>
    </div>
  );
}

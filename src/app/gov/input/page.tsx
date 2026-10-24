'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import api, { explainApiError } from '@/lib/api';
import { useRegionData } from '@/hooks/use-region-data';
import { MEKONG_REGIONS, RegionReading } from '@/data/mekong-regions';
import { LEVEL_META, METRICS, MetricKey, adviceFor, assess, formatValue, timeAgo } from '@/lib/risk';
import { Alert, LoadingBlock, PageHeader, Spinner, useToast } from '@/components/ui';

type Form = Record<MetricKey, string>;
const EMPTY: Form = { salinity: '', temperature: '', waterLevel: '', waterQuality: '' };

const toNumber = (v: string) => (v.trim() === '' ? NaN : Number(v.replace(',', '.')));
const toForm = (r: RegionReading): Form => ({
  salinity: String(r.salinity),
  temperature: String(r.temperature),
  waterLevel: String(r.waterLevel),
  waterQuality: String(r.waterQuality),
});

export default function GovInputPage() {
  const { toast, show } = useToast();
  const { byCode, readings, loading, error, reload } = useRegionData();

  const [province, setProvince] = useState('');
  const [form, setForm] = useState<Form>(EMPTY);
  const [note, setNote] = useState('');
  const [notify, setNotify] = useState(false);
  const [notifyTouched, setNotifyTouched] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<MetricKey | 'province' | 'form', string>>>({});
  const [saving, setSaving] = useState(false);
  const [recent, setRecent] = useState<RegionReading[]>([]);

  const loadRecent = useCallback(async () => {
    try {
      const res = await api.get('/api/data/recent');
      setRecent(res.data.history || []);
    } catch {
      /* lịch sử là phần phụ, bỏ qua lỗi */
    }
  }, []);
  useEffect(() => { loadRecent(); }, [loadRecent]);

  const pick = (code: string) => {
    setProvince(code);
    setErrors({});
    setNote('');
    setNotifyTouched(false);
    const cur = byCode.get(code);
    // Điền sẵn số liệu gần nhất: cán bộ chỉ cần sửa chỉ số thay đổi
    setForm(cur ? toForm(cur) : EMPTY);
  };

  const values = useMemo(() => {
    const v = Object.fromEntries(METRICS.map((m) => [m.key, toNumber(form[m.key])])) as Record<MetricKey, number>;
    return { v, complete: METRICS.every((m) => Number.isFinite(v[m.key])) };
  }, [form]);

  const preview = useMemo(() => (values.complete ? assess(values.v) : null), [values]);

  // Gợi ý tự động: mức cao trở lên thì nên báo cho nông dân
  useEffect(() => {
    if (!notifyTouched) setNotify(!!preview && (preview.overall === 'high' || preview.overall === 'extreme'));
  }, [preview, notifyTouched]);

  const validate = () => {
    const e: typeof errors = {};
    if (!province) e.province = 'Vui lòng chọn tỉnh, thành.';
    for (const m of METRICS) {
      const n = toNumber(form[m.key]);
      if (!Number.isFinite(n)) e[m.key] = `Nhập ${m.label.toLowerCase()}.`;
      else if (n < m.min || n > m.max) e[m.key] = `Phải từ ${m.min} đến ${m.max}${m.unit ? ' ' + m.unit : ''}.`;
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const save = async () => {
    if (!validate()) return;
    setSaving(true);
    try {
      const res = await api.post('/api/data/regions', { provinceCode: province, ...Object.fromEntries(METRICS.map((m) => [m.key, form[m.key]])), note, notify });
      const name = MEKONG_REGIONS.find((r) => r.code === province)?.name;
      show(`Đã lưu số liệu ${name}. Bản đồ của nông dân đã cập nhật${res.data.notified ? ' và thông báo đã được gửi' : ''}.`, 'success', 6000);
      setNote('');
      await Promise.all([reload(), loadRecent()]);
    } catch (e) {
      const i = await explainApiError(e);
      if (i.field && METRICS.some((m) => m.key === i.field)) setErrors({ [i.field]: i.message });
      else setErrors({ form: i.message });
    } finally {
      setSaving(false);
    }
  };

  const region = MEKONG_REGIONS.find((r) => r.code === province);
  const cur = province ? byCode.get(province) : undefined;

  return (
    <div className="page">
      {toast}
      <PageHeader
        title="Nhập liệu theo tỉnh"
        subtitle="Chọn tỉnh, nhập 4 chỉ số quan trắc. Sau khi lưu, nông dân thấy ngay số liệu và khuyến cáo trên bản đồ của họ."
        actions={<span className="badge border-slate-600 bg-slate-800 text-slate-200">{readings.length}/{MEKONG_REGIONS.length} tỉnh đã có số liệu</span>}
      />
      {error && <div className="mb-5"><Alert kind="error" title="Không tải được số liệu hiện có" action={<button className="btn btn-secondary px-3 py-1" onClick={reload}>Thử lại</button>}>{error.message}</Alert></div>}

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_380px]">
        {/* ============ FORM ============ */}
        <section className="card p-5 md:p-6">
          <h2 className="text-lg font-bold text-white">1. Chọn khu vực</h2>
          <div className="mt-3">
            <label className="label" htmlFor="i-prov">Tỉnh, thành (Đồng bằng sông Cửu Long)</label>
            <select id="i-prov" value={province} onChange={(e) => pick(e.target.value)} className={`input ${errors.province ? 'input-error' : ''}`}>
              <option value="">Chọn tỉnh, thành...</option>
              {MEKONG_REGIONS.map((r) => (
                <option key={r.code} value={r.code}>{r.name}{byCode.has(r.code) ? '' : ' (chưa có số liệu)'}</option>
              ))}
            </select>
            {errors.province && <p className="field-error">{errors.province}</p>}
            {cur && <p className="mt-1 text-xs text-slate-400">Đã điền sẵn số liệu cập nhật {timeAgo(cur.updatedAt)}{cur.isSample ? ' (số liệu mẫu)' : ''}. Chỉ cần sửa chỉ số thay đổi.</p>}
          </div>

          <h2 className="mt-8 text-lg font-bold text-white">2. Nhập số liệu quan trắc</h2>
          <div className="mt-3 grid gap-4 sm:grid-cols-2">
            {METRICS.map((m) => {
              const n = toNumber(form[m.key]);
              const lv = Number.isFinite(n) ? m.level(n) : null;
              return (
                <div key={m.key}>
                  <label className="label" htmlFor={`i-${m.key}`}>{m.label}{m.unit ? ` (${m.unit})` : ''}</label>
                  <div className="relative">
                    <input id={`i-${m.key}`} inputMode="decimal" value={form[m.key]} disabled={!province}
                      onChange={(e) => setForm((f) => ({ ...f, [m.key]: e.target.value.replace(/[^\d.,]/g, '') }))}
                      placeholder={`${m.min} đến ${m.max}`} className={`input ${errors[m.key] ? 'input-error' : ''} ${lv ? 'pr-28' : ''}`} />
                    {lv && <span className={`badge absolute right-2 top-1/2 -translate-y-1/2 ${LEVEL_META[lv].badge}`}>{LEVEL_META[lv].label}</span>}
                  </div>
                  {errors[m.key] ? <p className="field-error">{errors[m.key]}</p> : <p className="mt-1 text-xs leading-snug text-slate-500">{m.thresholds}</p>}
                </div>
              );
            })}
          </div>

          <h2 className="mt-8 text-lg font-bold text-white">3. Ghi chú và thông báo</h2>
          <div className="mt-3">
            <label className="label" htmlFor="i-note">Ghi chú cho nông dân (không bắt buộc)</label>
            <textarea id="i-note" rows={3} maxLength={500} value={note} onChange={(e) => setNote(e.target.value)} disabled={!province}
              placeholder="Ví dụ: Đo tại cống Ba Lai lúc 6 giờ sáng, đang đóng cống ngăn mặn." className="input resize-y" />
          </div>
          <label className="mt-4 flex cursor-pointer items-start gap-3 rounded-lg border border-slate-800 bg-slate-950 p-4">
            <input type="checkbox" checked={notify} onChange={(e) => { setNotify(e.target.checked); setNotifyTouched(true); }} className="mt-1 h-4 w-4 accent-cyan-500" />
            <span className="text-sm">
              <span className="font-semibold text-white">Gửi thông báo đến nông dân{region ? ` ${region.name}` : ''}</span>
              <span className="mt-0.5 block text-slate-400">Số liệu và khuyến cáo xuất hiện trong mục Tin nhắn của nông dân. Tự bật khi rủi ro ở mức cao trở lên.</span>
            </span>
          </label>

          {errors.form && <div className="mt-4"><Alert kind="error">{errors.form}</Alert></div>}
          <div className="mt-6 flex justify-end">
            <button onClick={save} disabled={saving || !province} className="btn btn-primary px-8 py-2.5">
              {saving && <Spinner size={16} />} Lưu số liệu
            </button>
          </div>
        </section>

        {/* ============ XEM TRƯỚC: NÔNG DÂN SẼ THẤY ============ */}
        <aside className="lg:sticky lg:top-6 lg:self-start">
          <div className="card p-5">
            <h2 className="font-bold text-white">Nông dân sẽ thấy</h2>
            <p className="mt-1 text-xs text-slate-400">Xem trước nội dung hiển thị trên Bản đồ rủi ro.</p>
            {region && preview ? (
              <div className="mt-4">
                <p className="text-lg font-bold text-white">{region.name}</p>
                <span className={`badge mt-2 ${LEVEL_META[preview.overall].badge}`}>Rủi ro tổng hợp: {LEVEL_META[preview.overall].label}</span>
                <dl className="mt-4 grid grid-cols-2 gap-2">
                  {METRICS.map((m) => (
                    <div key={m.key} className="rounded-lg border border-slate-800 bg-slate-950 p-2.5">
                      <dt className="text-xs text-slate-400">{m.short}</dt>
                      <dd className="text-lg font-bold text-white">{formatValue(values.v[m.key], m.unit)}</dd>
                      <span className="inline-block h-1.5 w-full rounded" style={{ background: LEVEL_META[preview.per[m.key]].color }} />
                    </div>
                  ))}
                </dl>
                <p className="mt-4 text-sm font-semibold text-white">Khuyến cáo</p>
                <ul className="mt-1.5 list-disc space-y-1 pl-5 text-sm leading-relaxed text-slate-300 marker:text-cyan-500">
                  {adviceFor(values.v as any).map((t) => <li key={t}>{t}</li>)}
                </ul>
                {note && <p className="mt-3 rounded-lg bg-slate-950 p-3 text-sm text-slate-300"><span className="block text-xs font-semibold text-slate-400">Ghi chú</span>{note}</p>}
              </div>
            ) : (
              <p className="mt-6 rounded-lg border border-dashed border-slate-700 p-6 text-center text-sm text-slate-400">Chọn tỉnh và nhập đủ 4 chỉ số để xem trước.</p>
            )}
          </div>
        </aside>
      </div>

      {/* ============ TÌNH TRẠNG 13 TỈNH ============ */}
      <section className="mt-10">
        <h2 className="text-lg font-bold text-white">Tình trạng số liệu 13 tỉnh, thành</h2>
        <p className="mt-1 text-sm text-slate-400">Nhấn vào một dòng để nạp số liệu tỉnh đó vào biểu mẫu phía trên.</p>
        {loading ? <LoadingBlock /> : (
          <div className="mt-4 overflow-x-auto rounded-xl border border-slate-800">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead className="bg-slate-900 text-xs text-slate-400">
                <tr>
                  <th className="px-4 py-3 font-semibold">Tỉnh, thành</th>
                  {METRICS.map((m) => <th key={m.key} className="px-4 py-3 font-semibold">{m.short}</th>)}
                  <th className="px-4 py-3 font-semibold">Mức tổng hợp</th>
                  <th className="px-4 py-3 font-semibold">Cập nhật</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {MEKONG_REGIONS.map((r) => {
                  const d = byCode.get(r.code);
                  const a = d ? assess(d) : null;
                  return (
                    <tr key={r.code} onClick={() => pick(r.code)} className={`cursor-pointer transition-colors hover:bg-slate-900 ${province === r.code ? 'bg-slate-900' : ''}`}>
                      <td className="px-4 py-3 font-medium text-white">{r.name}</td>
                      {METRICS.map((m) => <td key={m.key} className="px-4 py-3 text-slate-300">{d ? formatValue(d[m.key], m.unit) : '-'}</td>)}
                      <td className="px-4 py-3">{a ? <span className={`badge ${LEVEL_META[a.overall].badge}`}>{LEVEL_META[a.overall].label}</span> : <span className="text-xs text-yellow-300">Chưa có số liệu</span>}</td>
                      <td className="px-4 py-3 text-xs text-slate-400">{d ? `${timeAgo(d.updatedAt)}${d.isSample ? ' (mẫu)' : ''}` : '-'}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="mt-10">
        <h2 className="text-lg font-bold text-white">Lịch sử nhập liệu gần đây</h2>
        {recent.length === 0 ? <p className="mt-3 text-sm text-slate-400">Chưa có lần nhập nào.</p> : (
          <ul className="mt-4 divide-y divide-slate-800 rounded-xl border border-slate-800">
            {recent.slice(0, 12).map((h) => {
              const a = assess(h);
              return (
                <li key={h.id} className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 text-sm">
                  <div>
                    <span className="font-semibold text-white">{h.provinceName}</span>
                    <span className="ml-2 text-slate-400">{METRICS.map((m) => `${m.short} ${formatValue(h[m.key], m.unit)}`).join(' · ')}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`badge ${LEVEL_META[a.overall].badge}`}>{LEVEL_META[a.overall].label}</span>
                    <span className="text-xs text-slate-500">{h.updatedByName || ''} · {new Date(h.updatedAt).toLocaleString('vi-VN')}</span>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}

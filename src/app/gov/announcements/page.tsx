'use client';

import { useCallback, useEffect, useState } from 'react';
import api, { explainApiError } from '@/lib/api';
import { useRealtime } from '@/lib/realtime';
import { MEKONG_REGIONS } from '@/data/mekong-regions';
import AnnouncementCard, { Announcement } from '@/components/announcement-card';
import { Alert, EmptyState, LoadingBlock, Modal, PageHeader, Spinner, useToast } from '@/components/ui';

const LEVELS = [
  { value: '', label: 'Thông tin chung (không phải cảnh báo)' },
  { value: 'moderate', label: 'Lưu ý, cần theo dõi' },
  { value: 'high', label: 'Cảnh báo cao' },
  { value: 'extreme', label: 'Khẩn cấp' },
];

const TEMPLATES = [
  { label: 'Cảnh báo xâm nhập mặn', title: 'Cảnh báo xâm nhập mặn', level: 'high', content: 'Độ mặn trên các kênh, rạch đang tăng cao. Đề nghị bà con đóng cống lấy nước, tạm ngừng bơm nước vào ruộng và vườn, ưu tiên dùng nước ngọt đã trữ. Chỉ lấy nước trở lại khi độ mặn xuống dưới 1‰.' },
  { label: 'Cảnh báo nắng nóng', title: 'Cảnh báo nắng nóng kéo dài', level: 'high', content: 'Nắng nóng kéo dài trong những ngày tới. Đề nghị bà con tưới vào sáng sớm hoặc chiều mát, che nắng cho cây non và vật nuôi, tăng sục khí cho ao nuôi và hạn chế làm việc ngoài đồng từ 10 giờ đến 15 giờ.' },
  { label: 'Cảnh báo lũ, triều cường', title: 'Cảnh báo lũ và triều cường', level: 'high', content: 'Mực nước dự báo dâng cao trong những ngày tới. Đề nghị bà con kiểm tra bờ bao, chuẩn bị máy bơm, thu hoạch sớm phần đã chín và di dời vật nuôi, vật tư lên nơi cao.' },
  { label: 'Cảnh báo ô nhiễm nước', title: 'Cảnh báo chất lượng nước', level: 'high', content: 'Phát hiện dấu hiệu ô nhiễm trên một số kênh, rạch. Đề nghị bà con tạm ngừng lấy nước từ nguồn này cho ao nuôi và sinh hoạt, báo ngay cho Ủy ban nhân dân xã khi thấy tôm cá chết bất thường.' },
  { label: 'Thông báo chung', title: '', level: '', content: '' },
];

export default function GovAnnouncementsPage() {
  const { toast, show } = useToast();
  const [items, setItems] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [province, setProvince] = useState('');
  const [level, setLevel] = useState('');
  const [fieldError, setFieldError] = useState('');
  const [sending, setSending] = useState(false);
  const [toDelete, setToDelete] = useState<Announcement | null>(null);

  const load = useCallback(async () => {
    try {
      const res = await api.get('/api/messages/announcements');
      setItems(res.data.announcements || []);
      setError('');
    } catch (e) {
      setError((await explainApiError(e)).message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
    const t = setInterval(load, 30000);
    return () => clearInterval(t);
  }, [load]);
  useRealtime({ announcement: () => load() });

  const publish = async () => {
    setFieldError('');
    if (!content.trim()) return setFieldError('Vui lòng nhập nội dung thông báo.');
    setSending(true);
    try {
      await api.post('/api/messages/announcements', {
        title: title.trim(),
        content: content.trim(),
        provinceCode: province,
        level: level || undefined,
        kind: level ? 'ALERT' : 'ANNOUNCEMENT',
      });
      setTitle('');
      setContent('');
      setLevel('');
      await load();
      show(province ? `Đã phát hành thông báo cho ${MEKONG_REGIONS.find((r) => r.code === province)?.name}.` : 'Đã phát hành thông báo đến toàn bộ nông dân.');
    } catch (e) {
      const i = await explainApiError(e);
      setFieldError(i.message);
    } finally {
      setSending(false);
    }
  };

  const remove = async () => {
    if (!toDelete) return;
    try {
      await api.delete(`/api/messages/announcements/${toDelete.id}`);
      setItems((prev) => prev.filter((a) => a.id !== toDelete.id));
      show('Đã xóa thông báo.');
    } catch (e) {
      show((await explainApiError(e)).message, 'error', 6000);
    } finally {
      setToDelete(null);
    }
  };

  const audience = province ? `nông dân ${MEKONG_REGIONS.find((r) => r.code === province)?.name}` : 'toàn bộ nông dân vùng Đồng bằng sông Cửu Long';

  return (
    <div className="page">
      {toast}
      <PageHeader title="Tin nhắn chung" subtitle="Phát hành thông báo một chiều đến nông dân. Nông dân đọc trong mục Tin nhắn, tab Thông báo chung." />

      <section className="card p-5 md:p-6">
        <h2 className="text-lg font-bold text-white">Soạn thông báo mới</h2>

        <p className="mt-4 text-sm font-medium text-slate-300">Chọn mẫu có sẵn (không bắt buộc)</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {TEMPLATES.map((t) => (
            <button key={t.label} type="button" onClick={() => { setTitle(t.title); setContent(t.content); setLevel(t.level); }}
              className="rounded-full border border-slate-700 px-3 py-1.5 text-xs text-slate-300 hover:border-cyan-500 hover:text-white">
              {t.label}
            </button>
          ))}
        </div>

        <div className="mt-5 grid gap-4 md:grid-cols-2">
          <div>
            <label className="label" htmlFor="a-prov">Gửi đến</label>
            <select id="a-prov" value={province} onChange={(e) => setProvince(e.target.value)} className="input">
              <option value="">Toàn vùng Đồng bằng sông Cửu Long</option>
              {MEKONG_REGIONS.map((r) => <option key={r.code} value={r.code}>{r.name}</option>)}
            </select>
            <p className="mt-1 text-xs text-slate-500">Nông dân chỉ thấy thông báo của tỉnh mình đã được gán trong hồ sơ, cùng thông báo toàn vùng.</p>
          </div>
          <div>
            <label className="label" htmlFor="a-level">Mức độ</label>
            <select id="a-level" value={level} onChange={(e) => setLevel(e.target.value)} className="input">
              {LEVELS.map((l) => <option key={l.value} value={l.value}>{l.label}</option>)}
            </select>
          </div>
        </div>

        <div className="mt-4">
          <label className="label" htmlFor="a-title">Tiêu đề (không bắt buộc)</label>
          <input id="a-title" value={title} onChange={(e) => setTitle(e.target.value)} maxLength={150} className="input" placeholder="Ví dụ: Cảnh báo xâm nhập mặn" />
        </div>
        <div className="mt-4">
          <label className="label" htmlFor="a-content">Nội dung</label>
          <textarea id="a-content" value={content} onChange={(e) => setContent(e.target.value)} maxLength={2000} rows={5}
            className={`input resize-y ${fieldError ? 'input-error' : ''}`} placeholder="Nhập nội dung thông báo, viết ngắn gọn và dễ hiểu..." />
          <div className="mt-1 flex justify-between text-xs">
            <span className="field-error !mt-0">{fieldError}</span>
            <span className="text-slate-500">{content.length}/2000</span>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-slate-400">Thông báo sẽ được gửi đến {audience}.</p>
          <button onClick={publish} disabled={sending} className="btn btn-primary px-6">
            {sending && <Spinner size={16} />} Phát hành
          </button>
        </div>
      </section>

      <h2 className="mb-3 mt-10 text-lg font-bold text-white">Thông báo đã phát hành ({items.length})</h2>
      {error && <div className="mb-4"><Alert kind="error">{error}</Alert></div>}
      {loading ? (
        <LoadingBlock />
      ) : items.length === 0 ? (
        <EmptyState title="Chưa có thông báo nào">Hãy soạn thông báo đầu tiên ở phía trên.</EmptyState>
      ) : (
        <div className="space-y-4">{items.map((a) => <AnnouncementCard key={a.id} a={a} onDelete={() => setToDelete(a)} />)}</div>
      )}

      <Modal open={!!toDelete} onClose={() => setToDelete(null)} title="Xóa thông báo"
        footer={<><button className="btn btn-secondary" onClick={() => setToDelete(null)}>Hủy</button><button className="btn btn-danger" onClick={remove}>Xóa</button></>}>
        <p className="text-sm leading-relaxed text-slate-300">Thông báo này sẽ biến mất khỏi hộp thư của tất cả nông dân. Bạn có chắc chắn muốn xóa?</p>
      </Modal>
    </div>
  );
}

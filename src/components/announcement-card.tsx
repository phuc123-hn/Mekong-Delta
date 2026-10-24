import { LEVEL_META, RiskLevel, timeAgo } from '@/lib/risk';

export interface Announcement {
  id: string;
  title: string | null;
  content: string;
  kind: 'ANNOUNCEMENT' | 'ALERT' | 'DATA' | 'CHAT';
  level: RiskLevel | null;
  provinceName: string | null;
  senderName: string;
  createdAt: string;
}

const KIND_LABEL: Record<string, string> = { ALERT: 'Cảnh báo', DATA: 'Cập nhật số liệu', ANNOUNCEMENT: 'Thông báo' };

export default function AnnouncementCard({ a, isNew, onDelete }: { a: Announcement; isNew?: boolean; onDelete?: () => void }) {
  const level = a.level ? LEVEL_META[a.level] : null;
  return (
    <article className={`card p-5 ${a.kind === 'ALERT' ? 'border-l-4' : ''}`} style={a.kind === 'ALERT' && level ? { borderLeftColor: level.color } : undefined}>
      <div className="flex flex-wrap items-center gap-2">
        <span className="badge border-slate-600 bg-slate-800 text-slate-200">{KIND_LABEL[a.kind] || 'Thông báo'}</span>
        {level && <span className={`badge ${level.badge}`}>Mức {level.label.toLowerCase()}</span>}
        <span className="badge border-slate-700 text-slate-300">{a.provinceName || 'Toàn vùng ĐBSCL'}</span>
        {isNew && <span className="badge border-cyan-500/40 bg-cyan-500/15 text-cyan-200">Mới</span>}
      </div>
      {a.title && <h3 className="mt-3 text-lg font-bold text-white">{a.title}</h3>}
      <p className={`${a.title ? 'mt-2' : 'mt-3'} whitespace-pre-line leading-relaxed text-slate-200`}>{a.content}</p>
      <div className="mt-4 flex items-center justify-between gap-3 text-xs text-slate-400">
        <span>
          {a.senderName} · {timeAgo(a.createdAt)} ({new Date(a.createdAt).toLocaleString('vi-VN')})
        </span>
        {onDelete && (
          <button onClick={onDelete} className="btn btn-ghost px-2 py-1 text-xs text-red-300 hover:text-red-200">
            Xóa
          </button>
        )}
      </div>
    </article>
  );
}

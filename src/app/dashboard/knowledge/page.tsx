'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { KNOWLEDGE } from '@/data/knowledge';
import { EmptyState, PageHeader } from '@/components/ui';

const norm = (s: string) => s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd');

export default function KnowledgePage() {
  const [active, setActive] = useState(KNOWLEDGE[0].id);
  const [q, setQ] = useState('');

  const query = norm(q.trim());
  const searching = query.length > 0;

  // Khi tìm kiếm: lọc trên tất cả chủ đề, bỏ qua danh mục đang chọn
  const visible = useMemo(() => {
    const cats = searching ? KNOWLEDGE : KNOWLEDGE.filter((c) => c.id === active);
    return cats
      .map((c) => ({
        ...c,
        topics: searching ? c.topics.filter((t) => norm([t.title, t.summary, ...t.steps, t.caution || ''].join(' ')).includes(query)) : c.topics,
      }))
      .filter((c) => c.topics.length);
  }, [active, query, searching]);

  return (
    <div className="page">
      <PageHeader title="Kiến thức nhà nông" subtitle="Hướng dẫn thực hành cho từng loại rủi ro ở Đồng bằng sông Cửu Long, viết ngắn gọn để làm theo ngay." />

      <div className="grid gap-6 lg:grid-cols-[240px_minmax(0,1fr)]">
        {/* Danh mục: dạng chip cuộn ngang trên điện thoại, danh sách dọc trên máy tính */}
        <nav className="lg:sticky lg:top-6 lg:self-start" aria-label="Danh mục kiến thức">
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Tìm kiếm, ví dụ: độ mặn" className="input mb-3" aria-label="Tìm kiếm kiến thức" />
          <ul className="flex gap-2 overflow-x-auto pb-2 lg:max-h-[60vh] lg:flex-col lg:gap-1 lg:overflow-y-auto lg:overflow-x-visible lg:pb-0">
            {KNOWLEDGE.map((c) => (
              <li key={c.id} className="shrink-0">
                <button
                  onClick={() => { setActive(c.id); setQ(''); }}
                  className={`w-full whitespace-nowrap rounded-lg px-3 py-2 text-left text-sm font-medium transition-colors lg:whitespace-normal ${
                    !searching && active === c.id ? 'bg-cyan-600 text-white' : 'bg-slate-900 text-slate-300 hover:bg-slate-800 hover:text-white lg:bg-transparent'
                  }`}
                >
                  {c.name}
                </button>
              </li>
            ))}
          </ul>
        </nav>

        <div className="min-w-0 space-y-10">
          {visible.length === 0 && <EmptyState title="Không tìm thấy nội dung phù hợp">Thử từ khóa ngắn hơn hoặc chọn một danh mục ở bên trái.</EmptyState>}

          {visible.map((c) => (
            <section key={c.id}>
              <h2 className="text-2xl font-bold text-white">{c.name}</h2>
              <p className="mt-2 max-w-2xl leading-relaxed text-slate-400">{c.intro}</p>
              {c.newsSlug && (
                <Link href={`/tin-tuc/${c.newsSlug}`} target="_blank" className="btn btn-secondary mt-3 text-xs">
                  Đọc bản tin chi tiết về chủ đề này
                </Link>
              )}

              <div className="mt-5 space-y-4">
                {c.topics.map((t, i) => (
                  <article key={t.title} className="card p-5 md:p-6">
                    <h3 className="text-lg font-bold text-white">
                      {i + 1}. {t.title}
                    </h3>
                    <p className="mt-1 text-sm leading-relaxed text-slate-400">{t.summary}</p>
                    <p className="mt-4 text-sm font-semibold text-cyan-300">Việc cần làm</p>
                    <ol className="mt-2 list-decimal space-y-2 pl-5 text-sm leading-relaxed text-slate-200 marker:font-semibold marker:text-cyan-500">
                      {t.steps.map((s) => (
                        <li key={s}>{s}</li>
                      ))}
                    </ol>
                    {t.caution && (
                      <div className="mt-4 rounded-lg border border-yellow-500/30 bg-yellow-500/10 p-3 text-sm leading-relaxed text-yellow-100">
                        <span className="font-semibold">Lưu ý: </span>
                        {t.caution}
                      </div>
                    )}
                  </article>
                ))}
              </div>
            </section>
          ))}

          <p className="border-t border-slate-800 pt-6 text-xs leading-relaxed text-slate-500">
            Nội dung mang tính hướng dẫn chung. Khi áp dụng cho đất đai, giống cây và vật nuôi cụ thể, hãy hỏi cán bộ khuyến nông địa phương hoặc nhắn trong mục Tin nhắn. Hotline hỗ trợ: 0767248775.
          </p>
        </div>
      </div>
    </div>
  );
}

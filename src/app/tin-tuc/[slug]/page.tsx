import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { NEWS, HOTLINE, HOTLINE_DISPLAY, getArticle } from '@/data/news';
import { getImageCredit } from '@/data/news-credits';
import NewsImage from '@/components/news-image';
import { SiteFooter, SiteHeader } from '@/components/site-chrome';

const ROMAN = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII'];

export function generateStaticParams() {
  return NEWS.map((n) => ({ slug: n.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const a = getArticle(slug);
  return a ? { title: `${a.title} | Delta Stress Lens`, description: a.summary } : {};
}

export default async function NewsDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const article = getArticle(slug);
  if (!article) notFound();

  const credit = getImageCredit(article.slug);
  const others = NEWS.filter((n) => n.slug !== article.slug);
  const date = new Date(article.updatedAt).toLocaleDateString('vi-VN');

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <SiteHeader />

      {/* Ảnh đầu bài */}
      <div className="relative h-64 w-full overflow-hidden border-b border-slate-800 md:h-80">
        <NewsImage src={article.image} alt={article.imageAlt} tone={article.tone} className="absolute inset-0 h-full w-full" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-slate-950/20" />
        <div className="relative mx-auto flex h-full max-w-4xl flex-col justify-end px-4 pb-8 md:px-6">
          <span className="mb-3 w-fit rounded bg-slate-950/70 px-2.5 py-1 text-xs font-bold tracking-wide text-cyan-300">{article.category}</span>
          <h1 className="text-3xl font-bold leading-tight text-white md:text-4xl">{article.title}</h1>
        </div>
      </div>

      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-10 md:px-6 lg:grid-cols-[1fr_260px]">
        <article className="min-w-0 max-w-3xl">
          <p className="text-sm text-slate-400">
            Cập nhật {date} · Đọc trong khoảng {article.readMinutes} phút · Ban biên tập Delta Stress Lens
          </p>
          <p className="mt-5 border-l-4 border-cyan-500 pl-4 text-lg leading-relaxed text-slate-200">{article.summary}</p>

          {article.sections.map((s, si) => (
            <section key={s.heading} id={`muc-${si + 1}`} className="mt-12 scroll-mt-24">
              <h2 className="text-2xl font-bold text-white">
                {ROMAN[si]}. {s.heading}
              </h2>
              {s.intro && <p className="mt-3 leading-relaxed text-slate-300">{s.intro}</p>}

              {s.blocks.map((b, bi) => (
                <div key={bi} className="mt-6">
                  {b.title && (
                    <h3 className="text-lg font-semibold text-cyan-200">
                      {si + 1}.{bi + 1}. {b.title}
                    </h3>
                  )}
                  {b.paragraphs?.map((p, pi) => (
                    <p key={pi} className="mt-3 leading-[1.8] text-slate-300">
                      {p}
                    </p>
                  ))}
                  {b.bullets && (
                    <ul className="mt-3 list-disc space-y-2 pl-6 leading-[1.8] text-slate-300 marker:text-cyan-500">
                      {b.bullets.map((t, ti) => (
                        <li key={ti}>{t}</li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </section>
          ))}

          {/* Câu hỏi thường gặp */}
          <section id="cau-hoi" className="mt-14 scroll-mt-24">
            <h2 className="text-2xl font-bold text-white">{ROMAN[article.sections.length]}. Câu hỏi thường gặp</h2>
            <div className="mt-5 divide-y divide-slate-800 overflow-hidden rounded-xl border border-slate-800 bg-slate-900">
              {article.faq.map((f, i) => (
                <details key={i} className="group p-5">
                  <summary className="flex cursor-pointer list-none items-start justify-between gap-4 font-semibold text-white">
                    <span>
                      Câu {i + 1}. {f.q}
                    </span>
                    <span className="shrink-0 text-sm font-normal text-cyan-300 group-open:hidden">Xem</span>
                    <span className="hidden shrink-0 text-sm font-normal text-slate-400 group-open:inline">Ẩn</span>
                  </summary>
                  <p className="mt-3 leading-[1.8] text-slate-300">{f.a}</p>
                </details>
              ))}
            </div>
          </section>

          {/* Liên hệ cuối bài */}
          <section className="mt-14 rounded-xl border border-cyan-500/30 bg-cyan-500/10 p-6">
            <h2 className="text-xl font-bold text-white">Cần hỗ trợ thêm?</h2>
            <p className="mt-2 leading-relaxed text-slate-300">
              Nếu bà con cần hướng dẫn về xử lý rủi ro, đăng ký tài khoản hoặc sử dụng hệ thống, vui lòng liên hệ hotline.
            </p>
            <a href={`tel:${HOTLINE}`} className="mt-4 inline-block text-3xl font-bold text-cyan-300 hover:text-cyan-200">
              Hotline: {HOTLINE_DISPLAY}
            </a>
          </section>

          {credit && (
            <p className="mt-6 text-xs text-slate-500">
              Ảnh: {credit.title ? `${credit.title}, ` : ''}
              {credit.author || 'Không rõ tác giả'}
              {credit.license ? `, giấy phép ${credit.license}` : ''}
              {credit.source && (
                <>
                  {' '}
                  (<a href={credit.source} target="_blank" rel="noreferrer" className="underline hover:text-slate-300">nguồn</a>)
                </>
              )}
              .
            </p>
          )}

          <p className="mt-6 text-xs leading-relaxed text-slate-500">
            Bản tin cung cấp hướng dẫn chung, không thay thế chỉ đạo của cơ quan chức năng. Số liệu quan trắc thực tế của từng tỉnh được cập nhật trên Bản đồ rủi ro sau khi đăng nhập.
          </p>
        </article>

        {/* Mục lục + bài liên quan */}
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="card p-5">
            <p className="font-semibold text-white">Nội dung bài viết</p>
            <ol className="mt-3 space-y-2 text-sm">
              {article.sections.map((s, i) => (
                <li key={s.heading}>
                  <a href={`#muc-${i + 1}`} className="text-slate-300 hover:text-cyan-300">
                    {ROMAN[i]}. {s.heading}
                  </a>
                </li>
              ))}
              <li>
                <a href="#cau-hoi" className="text-slate-300 hover:text-cyan-300">
                  {ROMAN[article.sections.length]}. Câu hỏi thường gặp
                </a>
              </li>
            </ol>
          </div>
          <div className="card mt-5 p-5">
            <p className="font-semibold text-white">Bản tin khác</p>
            <ul className="mt-3 space-y-3 text-sm">
              {others.map((n) => (
                <li key={n.slug}>
                  <Link href={`/tin-tuc/${n.slug}`} className="block text-slate-300 hover:text-cyan-300">
                    <span className="text-xs font-bold text-cyan-400">{n.category}</span>
                    <span className="block leading-snug">{n.title}</span>
                  </Link>
                </li>
              ))}
            </ul>
            <Link href="/#tin-tuc" className="btn btn-secondary mt-5 w-full">
              Quay lại trang chủ
            </Link>
          </div>
        </aside>
      </div>

      <SiteFooter />
    </div>
  );
}

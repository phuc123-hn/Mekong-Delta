import Link from 'next/link';
import { NEWS } from '@/data/news';
import NewsImage from '@/components/news-image';
import { SiteFooter, SiteHeader } from '@/components/site-chrome';

const INDICATORS = [
  { name: 'Xâm nhập mặn', unit: 'Độ mặn (‰)', desc: 'Nước mặn từ cửa sông lấn sâu vào kênh rạch, ảnh hưởng đến lúa, cây ăn trái và nước sinh hoạt.', steps: ['Dưới 1', '1 đến 4', '4 đến 8', 'Từ 8'] },
  { name: 'Stress nhiệt', unit: 'Nhiệt độ cao nhất (°C)', desc: 'Nắng nóng kéo dài làm lúa lép hạt, ao nuôi thiếu oxy và vật nuôi giảm ăn.', steps: ['Dưới 35', '35 đến 37', '37 đến 39', 'Từ 39'] },
  { name: 'Rủi ro lũ', unit: 'Mức ngập (cm)', desc: 'Lũ thượng nguồn và triều cường gây ngập ruộng vườn, đường sá và nhà ở.', steps: ['Dưới 10', '10 đến 30', '30 đến 60', 'Từ 60'] },
  { name: 'Ô nhiễm nước', unit: 'Chất lượng nước WQI', desc: 'Nước kênh, rạch ô nhiễm gây hại ao nuôi, cây trồng và sức khỏe người dân.', steps: ['Từ 76', '51 đến 75', '26 đến 50', 'Dưới 26'] },
];
const STEP_COLORS = ['bg-emerald-500', 'bg-yellow-500', 'bg-orange-500', 'bg-red-500'];
const STEP_LABELS = ['Thấp', 'Trung bình', 'Cao', 'Rất cao'];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <SiteHeader />

      {/* Giới thiệu */}
      <main>
        <section className="border-b border-slate-800 bg-[radial-gradient(ellipse_at_70%_0%,rgba(8,145,178,0.25),transparent_60%)]">
          <div className="mx-auto max-w-6xl px-4 py-16 md:px-6 md:py-24">
            <h1 className="max-w-3xl text-4xl font-bold leading-tight text-white md:text-6xl">
              Thấu kính rủi ro cho Đồng bằng sông Cửu Long
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-relaxed text-slate-300">
              Hệ thống cảnh báo sớm bốn nhóm rủi ro: mặn, nhiệt, lũ và ô nhiễm nước. Cơ quan quản lý cập nhật số liệu theo từng tỉnh, nông dân xem ngay trên bản đồ để quyết định thời điểm lấy nước, xuống giống và thu hoạch.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link href="/dashboard/stress-map" className="btn btn-primary px-6 py-3 text-base">
                Xem bản đồ rủi ro
              </Link>
              <Link href="#chi-so" className="btn btn-secondary px-6 py-3 text-base">
                Tìm hiểu bốn chỉ số
              </Link>
            </div>
          </div>
        </section>

        {/* Bốn chỉ số */}
        <section id="chi-so" className="mx-auto max-w-6xl px-4 py-16 md:px-6">
          <h2 className="text-3xl font-bold text-white">Bốn chỉ số giám sát chính</h2>
          <p className="mt-2 max-w-2xl text-slate-400">Mỗi chỉ số được chia thành bốn mức. Màu trên bản đồ cho biết bạn cần theo dõi hay hành động ngay.</p>
          <div className="mt-8 grid gap-5 md:grid-cols-2">
            {INDICATORS.map((it) => (
              <div key={it.name} className="card p-6">
                <h3 className="text-xl font-bold text-white">{it.name}</h3>
                <p className="mt-1 text-sm font-medium text-cyan-300">{it.unit}</p>
                <p className="mt-3 text-sm leading-relaxed text-slate-400">{it.desc}</p>
                <div className="mt-5 grid grid-cols-4 gap-1.5">
                  {it.steps.map((s, i) => (
                    <div key={s}>
                      <div className={`h-2 rounded ${STEP_COLORS[i]}`} />
                      <p className="mt-1.5 text-xs font-semibold text-slate-200">{STEP_LABELS[i]}</p>
                      <p className="text-xs text-slate-400">{s}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <dl className="mt-12 grid gap-6 border-t border-slate-800 pt-10 text-center sm:grid-cols-3">
            {[
              ['13', 'tỉnh, thành thuộc Đồng bằng sông Cửu Long'],
              ['4', 'chỉ số quan trắc cho mỗi tỉnh'],
              ['2', 'nhóm người dùng: nông dân và cơ quan quản lý'],
            ].map(([n, l]) => (
              <div key={l}>
                <dt className="text-5xl font-bold text-white">{n}</dt>
                <dd className="mt-2 text-sm text-slate-400">{l}</dd>
              </div>
            ))}
          </dl>
        </section>

        {/* Tin tức & cảnh báo */}
        <section id="tin-tuc" className="border-y border-slate-800 bg-slate-900/40 py-16">
          <div className="mx-auto max-w-6xl px-4 md:px-6">
            <h2 className="text-3xl font-bold text-white">Tin tức và cảnh báo</h2>
            <p className="mt-2 max-w-2xl text-slate-400">Hướng dẫn chi tiết cho từng loại rủi ro. Kéo thanh cuộn bên dưới để xem thêm bản tin.</p>
          </div>

          <div className="mx-auto mt-8 max-w-6xl overflow-x-auto px-4 pb-6 md:px-6">
            <div className="flex snap-x snap-mandatory gap-5">
              {NEWS.map((n) => (
                <article key={n.slug} className="group relative h-[440px] w-[300px] shrink-0 snap-start overflow-hidden rounded-xl border border-slate-800 md:w-[380px]">
                  <NewsImage src={n.image} alt={n.imageAlt} tone={n.tone} className="absolute inset-0 h-full w-full transition-transform duration-500 group-hover:scale-105" />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/75 to-slate-950/10" />
                  <div className="relative flex h-full flex-col justify-end p-6">
                    <span className="mb-3 w-fit rounded bg-slate-950/70 px-2.5 py-1 text-xs font-bold tracking-wide text-cyan-300">{n.category}</span>
                    <h3 className="text-xl font-bold leading-snug text-white">{n.title}</h3>
                    <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-slate-300">{n.summary}</p>
                    <Link href={`/tin-tuc/${n.slug}`} className="btn btn-primary mt-5 w-fit">
                      Xem chi tiết
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* Kêu gọi hành động */}
        <section className="mx-auto max-w-3xl px-4 py-20 text-center md:px-6">
          <h2 className="text-3xl font-bold text-white">Bắt đầu theo dõi rủi ro cho vụ mùa của bạn</h2>
          <p className="mt-4 text-lg text-slate-400">Đăng ký bằng số điện thoại và email, xác thực bằng mã gửi về hộp thư, rồi xem số liệu mới nhất của tỉnh bạn.</p>
          <Link href="/auth" className="btn btn-primary mt-8 px-8 py-3 text-base">
            Đăng ký tài khoản
          </Link>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}

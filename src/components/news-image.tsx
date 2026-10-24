'use client';

import { useState } from 'react';
import type { NewsTone } from '@/data/news';

/** Nền thay thế khi chưa có ảnh thật: lớp màu theo chủ đề, không dùng biểu tượng. */
const FALLBACK: Record<NewsTone, string> = {
  salt: 'bg-[radial-gradient(ellipse_at_30%_20%,#38bdf8_0%,transparent_55%),linear-gradient(180deg,#0c4a6e,#082f49)]',
  heat: 'bg-[radial-gradient(ellipse_at_70%_15%,#fb923c_0%,transparent_55%),linear-gradient(180deg,#7c2d12,#431407)]',
  flood: 'bg-[radial-gradient(ellipse_at_40%_10%,#60a5fa_0%,transparent_55%),linear-gradient(180deg,#1e3a8a,#172554)]',
  alert: 'bg-[radial-gradient(ellipse_at_60%_20%,#f87171_0%,transparent_55%),linear-gradient(180deg,#7f1d1d,#450a0a)]',
  data: 'bg-[radial-gradient(ellipse_at_30%_20%,#34d399_0%,transparent_55%),linear-gradient(180deg,#064e3b,#022c22)]',
};

export default function NewsImage({ src, alt, tone, className = '' }: { src: string; alt: string; tone: NewsTone; className?: string }) {
  const [failed, setFailed] = useState(false);
  if (failed) return <div role="img" aria-label={alt} className={`${FALLBACK[tone]} ${className}`} />;
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={src} alt={alt} loading="lazy" onError={() => setFailed(true)} className={`object-cover ${className}`} />;
}

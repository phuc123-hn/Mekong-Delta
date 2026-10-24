import fs from 'fs';
import path from 'path';

export interface ImageCredit {
  author?: string;
  license?: string;
  source?: string;
  title?: string;
}

/** Đọc ghi công ảnh (nếu có) từ public/images/news/credits.json - file này do `npm run fetch:news-images` tạo ra. */
export function getImageCredit(slug: string): ImageCredit | null {
  try {
    const file = path.join(process.cwd(), 'public', 'images', 'news', 'credits.json');
    const all = JSON.parse(fs.readFileSync(file, 'utf8'));
    return all[slug] || null;
  } catch {
    return null;
  }
}

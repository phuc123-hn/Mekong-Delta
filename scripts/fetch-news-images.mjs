#!/usr/bin/env node
/**
 * Tải ảnh thật (giấy phép tự do) từ Wikimedia Commons cho 5 bản tin ở trang chủ.
 *
 *   npm run fetch:news-images            tải ảnh còn thiếu
 *   npm run fetch:news-images -- --force tải lại tất cả (ghi đè)
 *
 * Ảnh lưu vào public/images/news/<tên>.jpg, thông tin tác giả/giấy phép lưu vào credits.json
 * và được hiển thị ở cuối bài viết. Chỉ nhận ảnh JPEG, rộng từ 1400px, giấy phép CC0 / CC BY / CC BY-SA / Public domain.
 *
 * QUAN TRỌNG: hãy MỞ XEM từng ảnh sau khi tải. Kết quả tìm kiếm có thể chưa sát nội dung,
 * nếu chưa ưng ý chỉ cần chép ảnh của bạn đè lên file cùng tên.
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const OUT = path.join(process.cwd(), 'public', 'images', 'news');
const UA = 'DeltaStressLens/1.0 (du an hoc tap; script tai anh tin tuc)';

export const SLOTS = {
  man: { slug: 'canh-bao-xam-nhap-man', queries: ['saltwater intrusion Mekong Delta', 'Ben Tre sluice gate Mekong', 'Mekong Delta rice field canal'] },
  nhiet: { slug: 'stress-nhiet-nang-nong', queries: ['drought cracked soil rice field Vietnam', 'drought farmland cracked earth', 'dry rice field Vietnam'] },
  lu: { slug: 'rui-ro-lu-trieu-cuong', queries: ['Mekong Delta flood An Giang', 'flooded rice field Vietnam', 'Mekong flood season'] },
  'canh-bao': { slug: 'canh-bao-chat-luong-nuoc', queries: ['polluted canal Vietnam', 'water pollution river Vietnam', 'Mekong Delta canal garbage'] },
  'du-lieu': { slug: 'huong-dan-doc-so-lieu', queries: ['Mekong Delta aerial view', 'Mekong river aerial Vietnam', 'Can Tho Mekong river aerial'] },
};

const ALLOWED_LICENSE = /^(CC0|CC BY(-SA)? \d|CC BY(-SA)?$|Public domain|PD)/i;
const BLOCKED_LICENSE = /(NC|ND)/;
const stripHtml = (s = '') => s.replace(/<[^>]+>/g, '').replace(/&amp;/g, '&').replace(/\s+/g, ' ').trim();

/** Chọn ảnh phù hợp nhất trong kết quả tìm kiếm Commons (đúng định dạng, đủ lớn, giấy phép cho phép, ngang) */
export function pickBest(pages) {
  const list = Object.values(pages || {})
    .filter((p) => p.imageinfo?.[0])
    .sort((a, b) => (a.index ?? 0) - (b.index ?? 0));

  for (const p of list) {
    const info = p.imageinfo[0];
    const meta = info.extmetadata || {};
    const license = stripHtml(meta.LicenseShortName?.value || '');
    if (info.mime !== 'image/jpeg') continue;
    if (info.width < 1400 || info.height < 700 || info.width / info.height < 1.3) continue;
    if (!ALLOWED_LICENSE.test(license) || BLOCKED_LICENSE.test(license)) continue;
    if (stripHtml(meta.NonFree?.value || '').toLowerCase() === 'true') continue;
    return {
      downloadUrl: info.thumburl || info.url,
      credit: {
        title: stripHtml(p.title || '').replace(/^File:/, '').replace(/\.\w+$/, ''),
        author: stripHtml(meta.Artist?.value || '') || 'Không rõ tác giả',
        license,
        source: info.descriptionurl,
      },
    };
  }
  return null;
}

async function searchCommons(query) {
  const url = new URL('https://commons.wikimedia.org/w/api.php');
  url.search = new URLSearchParams({
    action: 'query', format: 'json', generator: 'search', gsrsearch: `${query} filetype:bitmap`,
    gsrnamespace: '6', gsrlimit: '30', prop: 'imageinfo', iiprop: 'url|size|mime|extmetadata', iiurlwidth: '1600',
  });
  const res = await fetch(url, { headers: { 'User-Agent': UA } });
  if (!res.ok) throw new Error(`Commons trả về HTTP ${res.status}`);
  return (await res.json()).query?.pages;
}

async function main() {
  const force = process.argv.includes('--force');
  await fs.mkdir(OUT, { recursive: true });
  const creditsFile = path.join(OUT, 'credits.json');
  const credits = await fs.readFile(creditsFile, 'utf8').then(JSON.parse).catch(() => ({}));

  for (const [name, { slug, queries }] of Object.entries(SLOTS)) {
    const file = path.join(OUT, `${name}.jpg`);
    if (!force && (await fs.stat(file).catch(() => null))) {
      console.log(`- ${name}.jpg đã có, bỏ qua (dùng --force để tải lại)`);
      continue;
    }
    let found = null;
    for (const q of queries) {
      try {
        found = pickBest(await searchCommons(q));
      } catch (e) {
        console.warn(`  Tìm "${q}" lỗi: ${e.message}`);
      }
      if (found) break;
    }
    if (!found) {
      console.warn(`x ${name}.jpg: không tìm được ảnh phù hợp, hãy tự chép ảnh vào ${file}`);
      continue;
    }
    const img = await fetch(found.downloadUrl, { headers: { 'User-Agent': UA } });
    if (!img.ok) {
      console.warn(`x ${name}.jpg: tải ảnh lỗi HTTP ${img.status}`);
      continue;
    }
    await fs.writeFile(file, Buffer.from(await img.arrayBuffer()));
    credits[slug] = found.credit;
    console.log(`+ ${name}.jpg  <- ${found.credit.title} (${found.credit.license}, ${found.credit.author})`);
  }
  await fs.writeFile(creditsFile, JSON.stringify(credits, null, 2));
  console.log('\nXong. Hãy mở public/images/news để kiểm tra ảnh, rồi chạy lại web.');
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((e) => {
    console.error('Lỗi:', e.message);
    process.exit(1);
  });
}

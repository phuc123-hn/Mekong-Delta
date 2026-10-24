import { NextRequest, NextResponse } from 'next/server';
import { askAI, AiError, aiConfigured, NOT_CONFIGURED_MESSAGE, ChatTurn } from '@/lib/ai';
import { LEVEL_META, METRICS, assess, formatValue } from '@/lib/risk';
import { MEKONG_REGIONS, RegionReading } from '@/data/mekong-regions';

// Máy chủ Next gọi backend Express để lấy số liệu mà cơ quan quản lý đã nhập, đưa vào ngữ cảnh cho AI.
const BACKEND = (process.env.BACKEND_INTERNAL_URL || process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001').replace(/\/+$/, '');

async function regionSnapshot(authorization: string | null): Promise<string> {
  if (!authorization) return '';
  try {
    const ctl = new AbortController();
    const timer = setTimeout(() => ctl.abort(), 4000);
    const res = await fetch(`${BACKEND}/api/data/regions`, { headers: { Authorization: authorization }, signal: ctl.signal, cache: 'no-store' });
    clearTimeout(timer);
    if (!res.ok) return '';
    const { readings = [] }: { readings: RegionReading[] } = await res.json();
    const byCode = new Map(readings.map((r) => [r.provinceCode, r]));
    return MEKONG_REGIONS.map((r) => {
      const d = byCode.get(r.code);
      if (!d) return `- ${r.name}: chưa có số liệu`;
      const a = assess(d);
      const vals = METRICS.map((m) => `${m.label.toLowerCase()} ${formatValue(d[m.key], m.unit)} (${LEVEL_META[a.per[m.key]].label})`).join('; ');
      return `- ${r.name}: ${vals}; mức tổng hợp ${LEVEL_META[a.overall].label}; cập nhật ${new Date(d.updatedAt).toLocaleDateString('vi-VN')}${d.isSample ? '; SỐ LIỆU MẪU' : ''}${d.note ? `; ghi chú: ${d.note}` : ''}`;
    }).join('\n');
  } catch {
    return ''; // không có số liệu vẫn trả lời được, chỉ kém cụ thể hơn
  }
}

const DATA_RULES = `
QUY TẮC VỀ SỐ LIỆU:
- Khi nói về tình hình hiện tại của một tỉnh, chỉ dùng số liệu trong phần "SỐ LIỆU QUAN TRẮC HIỆN CÓ" bên dưới. Không tự bịa số liệu.
- Tỉnh ghi "chưa có số liệu" thì nói rõ là chưa có số liệu, đừng suy đoán.
- Số liệu ghi "SỐ LIỆU MẪU" chỉ là dữ liệu minh họa, phải nhắc điều này nếu dựa vào nó.
- Ngưỡng rủi ro của hệ thống: độ mặn dưới 1‰ an toàn, từ 4‰ lúa thiệt hại nặng; nhiệt độ từ 35°C nắng nóng, từ 39°C đặc biệt gay gắt; mức ngập từ 30 cm gây hại hoa màu; WQI dưới 51 là nước kém.`;

interface Options {
  /** Dựng system prompt; nhận số liệu hiện có và tỉnh của người hỏi (nếu có) */
  buildSystem: (ctx: { snapshot: string; province: string }) => string;
}

export function createChatHandler({ buildSystem }: Options) {
  return async function POST(req: NextRequest) {
    let body: any;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ reply: 'Dữ liệu gửi lên không đúng định dạng.' }, { status: 400 });
    }

    const message = typeof body?.message === 'string' ? body.message.trim() : '';
    if (!message) return NextResponse.json({ reply: 'Vui lòng nhập câu hỏi rõ ràng.' }, { status: 400 });
    if (message.length > 2000) return NextResponse.json({ reply: 'Câu hỏi quá dài, vui lòng rút gọn dưới 2000 ký tự.' }, { status: 400 });

    if (!aiConfigured()) return NextResponse.json({ reply: NOT_CONFIGURED_MESSAGE }, { status: 503 });

    const history: ChatTurn[] = Array.isArray(body?.history)
      ? body.history
          .slice(-8)
          .filter((h: any) => (h?.role === 'user' || h?.role === 'model') && typeof h?.text === 'string')
          .map((h: any) => ({ role: h.role, text: h.text.slice(0, 2000) }))
      : [];

    const province = typeof body?.province === 'string' ? body.province.slice(0, 40) : '';
    const snapshot = await regionSnapshot(req.headers.get('authorization'));

    try {
      const system = buildSystem({ snapshot, province }) + (snapshot ? `${DATA_RULES}\n\nSỐ LIỆU QUAN TRẮC HIỆN CÓ (do cơ quan quản lý nhập):\n${snapshot}` : '');
      const reply = await askAI({ system, message, history });
      return NextResponse.json({ reply });
    } catch (e) {
      if (e instanceof AiError) return NextResponse.json({ reply: e.userMessage }, { status: e.status === 401 ? 502 : e.status });
      console.error('[AI] Lỗi không xác định:', e);
      return NextResponse.json({ reply: 'Có lỗi khi xử lý câu hỏi. Vui lòng thử lại.' }, { status: 500 });
    }
  };
}


import { AiError, AskOptions, normalizeHistory } from '@/lib/ai-types';

/**
 * Gọi Google Gemini (generateContent) từ phía máy chủ Next.js. KHÓA API KHÔNG BAO GIỜ gửi xuống trình duyệt.
 *
 * Biến môi trường (file .env.local):
 *   GEMINI_API_KEY   bắt buộc, lấy tại https://aistudio.google.com/apikey  (KHÔNG thêm tiền tố NEXT_PUBLIC_)
 *   GEMINI_MODEL     tùy chọn, ví dụ gemini-2.5-flash. Nếu để trống, hệ thống thử lần lượt các model trong MODEL_CHAIN
 */
const API_BASE = process.env.GEMINI_API_BASE || 'https://generativelanguage.googleapis.com/v1beta';

/**
 * Hạn mức miễn phí tính riêng theo từng model, và tên model thay đổi theo thời gian,
 * nên khi một model báo 404 (không tồn tại) / 429 (hết hạn mức) / 5xx (quá tải) sẽ tự thử model kế tiếp.
 */
export const MODEL_CHAIN = ['gemini-3.5-flash', 'gemini-2.5-flash', 'gemini-2.5-flash-lite'];

function modelList(): string[] {
  const custom = (process.env.GEMINI_MODEL || '').trim();
  return custom ? [custom, ...MODEL_CHAIN.filter((m) => m !== custom)] : MODEL_CHAIN;
}

export const hasGeminiKey = () => Boolean((process.env.GEMINI_API_KEY || '').trim());

function extractText(data: any): string {
  const parts = data?.candidates?.[0]?.content?.parts;
  return Array.isArray(parts) ? parts.map((p: any) => p?.text || '').join('').trim() : '';
}

export async function askGemini({ system, message, history = [], temperature = 0.6, maxOutputTokens = 4096 }: AskOptions): Promise<string> {
  const key = (process.env.GEMINI_API_KEY || '').trim();
  if (!key) {
    throw new AiError(503, 'Chưa cấu hình GEMINI_API_KEY trong file .env.local.');
  }

  const turns = normalizeHistory(history);

  const body = {
    systemInstruction: { parts: [{ text: system }] },
    contents: [...turns, { role: 'user', text: message }].map((t) => ({ role: t.role, parts: [{ text: t.text }] })),
    generationConfig: { temperature, maxOutputTokens },
  };

  let lastError: AiError | null = null;

  for (const model of modelList()) {
    const ctl = new AbortController();
    const timer = setTimeout(() => ctl.abort(), 30000);
    try {
      const res = await fetch(`${API_BASE}/models/${model}:generateContent`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-goog-api-key': key },
        body: JSON.stringify(body),
        signal: ctl.signal,
        cache: 'no-store',
      });

      if (res.ok) {
        const data = await res.json();
        const text = extractText(data);
        if (text) return text;
        const blocked = data?.promptFeedback?.blockReason || data?.candidates?.[0]?.finishReason;
        lastError = new AiError(502, blocked === 'SAFETY' || data?.promptFeedback?.blockReason ? 'Câu hỏi này không trả lời được vì bộ lọc an toàn của Gemini. Hãy diễn đạt lại.' : 'Gemini không trả về nội dung. Hãy thử hỏi lại.');
        continue;
      }

      const err = await res.json().catch(() => ({}));
      const msg: string = err?.error?.message || '';
      const reason: string = err?.error?.details?.find?.((d: any) => d?.reason)?.reason || '';
      console.error(`[Gemini] ${model} -> HTTP ${res.status} ${reason} ${msg.slice(0, 200)}`);

      // Lỗi về khóa: dừng ngay, thử model khác cũng vô ích
      if (res.status === 400 && (reason === 'API_KEY_INVALID' || /API key not valid/i.test(msg))) {
        throw new AiError(401, 'GEMINI_API_KEY không hợp lệ. Hãy tạo lại khóa tại https://aistudio.google.com/apikey và dán đúng vào .env.local (không có dấu cách hay dấu ngoặc kép).');
      }
      if (res.status === 403) {
        throw new AiError(403, 'Khóa Gemini không có quyền gọi API này. Kiểm tra khóa có bị giới hạn ứng dụng/IP, hoặc dự án trên Google AI Studio đã bật Generative Language API chưa.');
      }
      if (res.status === 400 && /location is not supported/i.test(msg)) {
        throw new AiError(403, 'Gemini API chưa hỗ trợ vị trí mạng hiện tại của bạn. Hãy thử tắt VPN/proxy hoặc đổi mạng.');
      }

      if (res.status === 404) lastError = new AiError(502, `Model ${model} không tồn tại hoặc không còn được hỗ trợ.`);
      else if (res.status === 429) lastError = new AiError(429, 'Đã dùng hết hạn mức miễn phí của Gemini trong thời điểm này. Vui lòng thử lại sau ít phút.');
      else if (res.status >= 500) lastError = new AiError(503, 'Máy chủ Gemini đang quá tải. Vui lòng thử lại sau ít phút.');
      else lastError = new AiError(502, `Gemini từ chối yêu cầu (${res.status}). ${msg.slice(0, 160)}`);
    } catch (e: any) {
      if (e instanceof AiError) throw e;
      console.error(`[Gemini] ${model} lỗi kết nối:`, e?.name, e?.message);
      lastError = new AiError(
        504,
        e?.name === 'AbortError'
          ? 'Gemini phản hồi quá chậm (hơn 30 giây). Vui lòng thử lại.'
          : 'Không kết nối được tới Gemini. Kiểm tra mạng của máy chủ web hoặc thử tắt VPN/proxy.'
      );
    } finally {
      clearTimeout(timer);
    }
  }

  throw lastError ?? new AiError(502, 'Không gọi được Gemini.');
}

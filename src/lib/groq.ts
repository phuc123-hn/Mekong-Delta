import { AiError, AskOptions, normalizeHistory } from '@/lib/ai-types';

/**
 * Gọi Groq (API tương thích OpenAI) từ phía máy chủ Next.js. Khóa không bao giờ gửi xuống trình duyệt.
 *
 * Biến môi trường (.env.local):
 *   GROQ_API_KEY   bắt buộc, tạo tại https://console.groq.com/keys
 *   GROQ_MODEL     tùy chọn, ví dụ openai/gpt-oss-120b. Để trống thì thử lần lượt các model trong GROQ_MODEL_CHAIN
 */
const API_BASE = (process.env.GROQ_API_BASE || 'https://api.groq.com/openai/v1').replace(/\/+$/, '');

/** Hạn mức miễn phí của Groq tính riêng từng model, nên model nào hết lượt thì tự sang model kế tiếp */
export const GROQ_MODEL_CHAIN = ['openai/gpt-oss-120b', 'llama-3.3-70b-versatile', 'openai/gpt-oss-20b', 'llama-3.1-8b-instant'];

export const hasGroqKey = () => Boolean((process.env.GROQ_API_KEY || '').trim());

function modelList(): string[] {
  const custom = (process.env.GROQ_MODEL || '').trim();
  return custom ? [custom, ...GROQ_MODEL_CHAIN.filter((m) => m !== custom)] : GROQ_MODEL_CHAIN;
}

export async function askGroq({ system, message, history = [], temperature = 0.6, maxOutputTokens = 2048 }: AskOptions): Promise<string> {
  const key = (process.env.GROQ_API_KEY || '').trim();
  if (!key) throw new AiError(503, 'Chưa cấu hình GROQ_API_KEY trong file .env.local.');

  const messages = [
    { role: 'system', content: system },
    ...normalizeHistory(history).map((t) => ({ role: t.role === 'model' ? 'assistant' : 'user', content: t.text })),
    { role: 'user', content: message },
  ];

  let lastError: AiError | null = null;

  for (const model of modelList()) {
    const ctl = new AbortController();
    const timer = setTimeout(() => ctl.abort(), 30000);
    try {
      const res = await fetch(`${API_BASE}/chat/completions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${key}` },
        body: JSON.stringify({
          model,
          messages,
          temperature,
          // model suy luận (gpt-oss) dùng một phần số token cho bước suy nghĩ nên cần chừa dư chỗ cho câu trả lời
          max_completion_tokens: maxOutputTokens,
          // "reasoning_effort" chỉ hợp lệ với các model gpt-oss; gửi cho model khác sẽ bị báo lỗi 400
          ...(model.startsWith('openai/gpt-oss') ? { reasoning_effort: 'low' } : {}),
        }),
        signal: ctl.signal,
        cache: 'no-store',
      });

      if (res.ok) {
        const data = await res.json();
        const choice = data?.choices?.[0];
        const text = typeof choice?.message?.content === 'string' ? choice.message.content.trim() : '';
        if (text) return text;
        lastError = new AiError(502, choice?.finish_reason === 'length' ? 'Câu trả lời bị cắt do hết giới hạn độ dài. Hãy hỏi ngắn gọn hơn.' : 'AI không trả về nội dung. Hãy thử hỏi lại.');
        continue;
      }

      const err = await res.json().catch(() => ({}));
      const msg: string = err?.error?.message || '';
      const code: string = err?.error?.code || '';
      console.error(`[Groq] ${model} -> HTTP ${res.status} ${code} ${msg.slice(0, 200)}`);

      if (res.status === 401) {
        throw new AiError(401, 'GROQ_API_KEY không hợp lệ. Hãy tạo lại khóa tại https://console.groq.com/keys và dán đúng vào .env.local (không có dấu cách hay dấu ngoặc kép).');
      }
      if (res.status === 403) {
        throw new AiError(403, 'Khóa Groq bị từ chối (403). Có thể tổ chức của khóa bị hạn chế hoặc mạng hiện tại bị chặn, hãy thử tắt VPN/proxy hoặc đổi mạng.');
      }

      if (res.status === 404 || code === 'model_not_found' || code === 'model_decommissioned') lastError = new AiError(502, `Model ${model} không tồn tại hoặc đã ngừng hỗ trợ.`);
      else if (res.status === 429 || res.status === 413) lastError = new AiError(429, 'Đã dùng hết hạn mức miễn phí của Groq trong thời điểm này. Vui lòng thử lại sau ít phút.');
      else if (res.status >= 500) lastError = new AiError(503, 'Máy chủ Groq đang quá tải. Vui lòng thử lại sau ít phút.');
      else lastError = new AiError(502, `Groq từ chối yêu cầu (${res.status}). ${msg.slice(0, 160)}`);
    } catch (e: any) {
      if (e instanceof AiError) throw e;
      console.error(`[Groq] ${model} lỗi kết nối:`, e?.name, e?.message);
      lastError = new AiError(
        504,
        e?.name === 'AbortError' ? 'Groq phản hồi quá chậm (hơn 30 giây). Vui lòng thử lại.' : 'Không kết nối được tới Groq. Kiểm tra mạng của máy chủ web hoặc thử tắt VPN/proxy.'
      );
    } finally {
      clearTimeout(timer);
    }
  }

  throw lastError ?? new AiError(502, 'Không gọi được Groq.');
}

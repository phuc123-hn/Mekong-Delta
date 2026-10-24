import { AiError, AskOptions } from '@/lib/ai-types';
import { askGroq, hasGroqKey } from '@/lib/groq';
import { askGemini, hasGeminiKey } from '@/lib/gemini';

export { AiError };
export type { ChatTurn } from '@/lib/ai-types';

type Provider = 'groq' | 'gemini';

/**
 * Chọn nhà cung cấp AI theo khóa có trong .env.local. Mặc định ưu tiên Groq; đặt AI_PROVIDER=gemini để ưu tiên Gemini.
 * Nếu có đủ cả hai khóa, khi nhà cung cấp chính lỗi (hết hạn mức, quá tải, khóa sai...) sẽ tự thử nhà cung cấp còn lại.
 */
function providers(): Provider[] {
  const list: Provider[] = [];
  if (hasGroqKey()) list.push('groq');
  if (hasGeminiKey()) list.push('gemini');
  if ((process.env.AI_PROVIDER || '').toLowerCase() === 'gemini') list.sort((a) => (a === 'gemini' ? -1 : 1));
  return list;
}

export const aiConfigured = () => providers().length > 0;
export const NOT_CONFIGURED_MESSAGE =
  'Chưa cấu hình khóa AI. Hãy thêm GROQ_API_KEY (hoặc GEMINI_API_KEY) vào file .env.local rồi khởi động lại web (xem HUONG_DAN_CAP_NHAT.md).';

export async function askAI(opts: AskOptions): Promise<string> {
  const list = providers();
  if (!list.length) throw new AiError(503, NOT_CONFIGURED_MESSAGE);

  let firstError: AiError | null = null;
  for (const p of list) {
    try {
      return await (p === 'groq' ? askGroq(opts) : askGemini(opts));
    } catch (e) {
      if (!(e instanceof AiError)) throw e;
      firstError ??= e;
      if (list.length > 1) console.warn(`[AI] ${p} lỗi (${e.status}), thử nhà cung cấp còn lại...`);
    }
  }
  throw firstError!;
}

export interface ChatTurn {
  role: 'user' | 'model';
  text: string;
}

/** Lỗi gọi AI đã được diễn giải sang tiếng Việt để hiển thị thẳng cho người dùng */
export class AiError extends Error {
  constructor(public status: number, public userMessage: string) {
    super(userMessage);
  }
}

export interface AskOptions {
  system: string;
  message: string;
  history?: ChatTurn[];
  temperature?: number;
  maxOutputTokens?: number;
}

/** Gemini yêu cầu lượt hội thoại luân phiên user/model và bắt đầu bằng user; Groq/OpenAI cũng nên sạch như vậy */
export function normalizeHistory(history: ChatTurn[]): ChatTurn[] {
  const turns: ChatTurn[] = [];
  for (const t of history) {
    if (!t.text.trim()) continue;
    if (turns.length === 0 && t.role !== 'user') continue;
    if (turns.length && turns[turns.length - 1].role === t.role) continue;
    turns.push(t);
  }
  // Tin cuối là của người dùng sẽ trùng với câu hỏi hiện tại nên bỏ đi
  if (turns.length && turns[turns.length - 1].role === 'user') turns.pop();
  return turns;
}

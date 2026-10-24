'use client';

import { Fragment, useEffect, useRef, useState } from 'react';
import axios from 'axios';
import { Modal, Spinner } from '@/components/ui';
import { useAuthStore } from '@/store/auth-store';
import { regionName } from '@/data/mekong-regions';

interface Msg {
  id: string;
  text: string;
  isBot: boolean;
}

interface Props {
  endpoint: string;
  title: string;
  subtitle: string;
  intro: string;
  placeholder: string;
  thinking: string;
  errorText: string;
  suggestions: { label: string; text: string }[];
  footnote: string;
}

/** Hiển thị **đậm** trong câu trả lời của AI thay vì để lộ dấu sao */
function Rich({ text }: { text: string }) {
  return (
    <>
      {text.split(/\*\*(.+?)\*\*/g).map((part, i) => (i % 2 ? <strong key={i}>{part}</strong> : <Fragment key={i}>{part}</Fragment>))}
    </>
  );
}

export default function AiChat({ endpoint, title, subtitle, intro, placeholder, thinking, errorText, suggestions, footnote }: Props) {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [confirmClear, setConfirmClear] = useState(false);
  const { token, user } = useAuthStore();
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [messages.length, loading]);

  const send = async (override?: string) => {
    const question = (override ?? input).trim();
    if (!question || loading) return;
    // Gửi kèm vài lượt hội thoại gần nhất để AI hiểu ngữ cảnh câu hỏi tiếp theo
    const history = messages.slice(-8).map((m) => ({ role: m.isBot ? 'model' : 'user', text: m.text }));
    setMessages((m) => [...m, { id: `u${Date.now()}`, text: question, isBot: false }]);
    setInput('');
    setLoading(true);
    try {
      const res = await axios.post(
        endpoint,
        { message: question, history, province: regionName(user?.region) },
        { timeout: 90000, headers: token ? { Authorization: `Bearer ${token}` } : undefined }
      );
      setMessages((m) => [...m, { id: `b${Date.now()}`, text: res.data.reply || errorText, isBot: true }]);
    } catch (err: any) {
      // Máy chủ trả về lý do cụ thể (thiếu khóa, hết hạn mức...) thì hiển thị để biết cách xử lý
      const reason = err?.response?.data?.reply;
      setMessages((m) => [...m, { id: `b${Date.now()}`, text: reason || errorText, isBot: true }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-[calc(100vh-3.5rem)] flex-col">
      <div className="flex shrink-0 items-center justify-between gap-3 border-b border-slate-800 bg-slate-900 px-4 py-4 md:px-8">
        <div>
          <h1 className="text-xl font-bold text-white md:text-2xl">{title}</h1>
          <p className="text-sm text-slate-400">{subtitle}</p>
        </div>
        {messages.length > 0 && (
          <button onClick={() => setConfirmClear(true)} className="btn btn-secondary text-sm">
            Xóa lịch sử
          </button>
        )}
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto">
        <div className="mx-auto flex min-h-full max-w-3xl flex-col gap-4 px-4 py-6">
          {messages.length === 0 ? (
            <div className="my-auto text-center">
              <p className="mx-auto max-w-md leading-relaxed text-slate-300">{intro}</p>
              <div className="mt-6 flex flex-wrap justify-center gap-2">
                {suggestions.map((s) => (
                  <button key={s.label} onClick={() => send(s.text)} className="rounded-full border border-slate-700 px-4 py-2 text-sm text-slate-200 hover:border-cyan-500 hover:text-white">
                    {s.label}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            messages.map((m) => (
              <div key={m.id} className={`flex ${m.isBot ? 'justify-start' : 'justify-end'}`}>
                <div className={`max-w-[88%] whitespace-pre-wrap rounded-2xl px-4 py-3 text-sm leading-relaxed ${m.isBot ? 'rounded-bl-sm border border-slate-700 bg-slate-800 text-slate-100' : 'rounded-br-sm bg-cyan-600 text-white'}`}>
                  <Rich text={m.text} />
                </div>
              </div>
            ))
          )}
          {loading && (
            <div className="flex items-center gap-3 text-sm text-slate-400">
              <Spinner size={16} /> {thinking}
            </div>
          )}
          <div ref={endRef} />
        </div>
      </div>

      <div className="shrink-0 border-t border-slate-800 bg-slate-900 px-4 py-3">
        <div className="mx-auto flex max-w-3xl gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && send()}
            placeholder={placeholder}
            className="input py-3"
            aria-label="Nhập câu hỏi"
          />
          <button onClick={() => send()} disabled={!input.trim() || loading} className="btn btn-primary px-6">
            Gửi
          </button>
        </div>
        <p className="mx-auto mt-1.5 max-w-3xl text-xs text-slate-500">{footnote}</p>
      </div>

      <Modal
        open={confirmClear}
        onClose={() => setConfirmClear(false)}
        title="Xóa lịch sử trò chuyện"
        footer={
          <>
            <button className="btn btn-secondary" onClick={() => setConfirmClear(false)}>Hủy</button>
            <button className="btn btn-danger" onClick={() => { setMessages([]); setConfirmClear(false); }}>Xóa</button>
          </>
        }
      >
        <p className="text-sm text-slate-300">Toàn bộ cuộc trò chuyện hiện tại sẽ bị xóa. Bạn có chắc chắn?</p>
      </Modal>
    </div>
  );
}

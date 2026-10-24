'use client';

import { useEffect, useRef, useState } from 'react';
import { Spinner } from '@/components/ui';

export interface ChatMsg {
  id: string;
  content: string;
  fromMe: boolean;
  createdAt: string;
  senderName?: string;
}

interface Props {
  messages: ChatMsg[];
  onSend: (text: string) => Promise<void>;
  loading?: boolean;
  emptyText: string;
  placeholder?: string;
  suggestions?: string[];
  otherLabel: string;
}

const MAX = 2000;

/** Khung chat đơn giản dùng chung: danh sách cuộn được + ô nhập luôn nằm dưới cùng. Enter để gửi, Shift+Enter xuống dòng. */
export default function ChatThread({ messages, onSend, loading, emptyText, placeholder = 'Nhập tin nhắn...', suggestions, otherLabel }: Props) {
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [messages.length]);

  const send = async () => {
    const t = text.trim();
    if (!t || sending) return;
    setSending(true);
    try {
      await onSend(t);
      setText('');
    } catch {
      /* trang cha đã hiển thị lỗi; giữ nguyên nội dung để người dùng gửi lại */
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="min-h-0 flex-1 space-y-3 overflow-y-auto p-4">
        {loading ? (
          <div className="flex justify-center py-10"><Spinner /></div>
        ) : messages.length === 0 ? (
          <p className="mx-auto max-w-sm py-10 text-center text-sm leading-relaxed text-slate-400">{emptyText}</p>
        ) : (
          messages.map((m) => (
            <div key={m.id} className={`flex ${m.fromMe ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] rounded-2xl px-4 py-2.5 md:max-w-[70%] ${m.fromMe ? 'rounded-br-sm bg-cyan-600 text-white' : 'rounded-bl-sm bg-slate-800 text-slate-100'}`}>
                {!m.fromMe && <p className="mb-0.5 text-xs font-semibold text-cyan-300">{m.senderName || otherLabel}</p>}
                <p className="whitespace-pre-wrap break-words text-sm leading-relaxed">{m.content}</p>
                <p className={`mt-1 text-right text-[11px] ${m.fromMe ? 'text-cyan-100/80' : 'text-slate-400'}`}>
                  {new Date(m.createdAt).toLocaleString('vi-VN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit' })}
                </p>
              </div>
            </div>
          ))
        )}
        <div ref={endRef} />
      </div>

      <div className="border-t border-slate-800 bg-slate-900 p-3">
        {suggestions && messages.length === 0 && !loading && (
          <div className="mb-3 flex flex-wrap gap-2">
            {suggestions.map((s) => (
              <button key={s} onClick={() => setText(s)} className="rounded-full border border-slate-700 px-3 py-1 text-xs text-slate-300 hover:border-cyan-500 hover:text-white">
                {s}
              </button>
            ))}
          </div>
        )}
        <div className="flex items-end gap-2">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value.slice(0, MAX))}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                send();
              }
            }}
            rows={2}
            placeholder={placeholder}
            className="input max-h-40 min-h-[44px] resize-none"
          />
          <button onClick={send} disabled={!text.trim() || sending} className="btn btn-primary h-11 px-5">
            {sending ? <Spinner size={16} /> : 'Gửi'}
          </button>
        </div>
        <p className="mt-1.5 text-xs text-slate-500">Nhấn Enter để gửi, Shift + Enter để xuống dòng.</p>
      </div>
    </div>
  );
}

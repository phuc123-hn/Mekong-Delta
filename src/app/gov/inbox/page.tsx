'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import api, { explainApiError } from '@/lib/api';
import { useRealtime } from '@/lib/realtime';
import { timeAgo } from '@/lib/risk';
import ChatThread, { ChatMsg } from '@/components/chat-thread';
import { Alert, EmptyState, LoadingBlock, Modal, useToast } from '@/components/ui';

interface Conversation {
  farmerId: string;
  fullName: string;
  phone: string;
  regionName: string | null;
  lastMessage: string;
  lastFromFarmer: boolean;
  lastAt: string;
  unread: number;
}

interface FarmerInfo {
  id: string;
  fullName: string;
  phone: string;
  regionName: string | null;
}

export default function GovInboxPage() {
  const { toast, show } = useToast();
  const [convs, setConvs] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');

  const [activeId, setActiveId] = useState<string | null>(null);
  const [farmer, setFarmer] = useState<FarmerInfo | null>(null);
  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [threadLoading, setThreadLoading] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const activeRef = useRef<string | null>(null);
  activeRef.current = activeId;

  const loadConvs = useCallback(async () => {
    try {
      const res = await api.get('/api/messages/conversations');
      setConvs(res.data.conversations || []);
      setError('');
    } catch (e) {
      setError((await explainApiError(e)).message);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadThread = useCallback(async (id: string, silent = false) => {
    if (!silent) setThreadLoading(true);
    try {
      const res = await api.get(`/api/messages/conversations/${id}`);
      if (activeRef.current !== id) return;
      setFarmer(res.data.farmer);
      setMessages(res.data.messages || []);
      await api.post(`/api/messages/conversations/${id}/read`).catch(() => undefined);
      setConvs((prev) => prev.map((c) => (c.farmerId === id ? { ...c, unread: 0 } : c)));
    } catch (e) {
      show((await explainApiError(e)).message, 'error', 6000);
    } finally {
      setThreadLoading(false);
    }
  }, [show]);

  useEffect(() => {
    loadConvs();
    const t = setInterval(() => {
      loadConvs();
      if (activeRef.current) loadThread(activeRef.current, true);
    }, 20000);
    return () => clearInterval(t);
  }, [loadConvs, loadThread]);

  useRealtime({
    chat_message: (d: any) => {
      loadConvs();
      if (d?.farmerId && d.farmerId === activeRef.current) loadThread(d.farmerId, true);
      else if (d?.message && !d.byGov) show(`Tin nhắn mới từ ${d.farmerName || 'nông dân'}.`, 'info');
    },
  });

  const open = (id: string) => {
    setActiveId(id);
    setMessages([]);
    loadThread(id);
  };

  const send = async (text: string) => {
    if (!activeId) return;
    try {
      const res = await api.post(`/api/messages/conversations/${activeId}`, { content: text });
      setMessages((prev) => [...prev, res.data.message]);
      loadConvs();
    } catch (e) {
      show((await explainApiError(e)).message, 'error', 6000);
      throw e;
    }
  };

  const removeConversation = async () => {
    if (!activeId) return;
    try {
      await api.delete(`/api/messages/conversations/${activeId}`);
      setConfirmDelete(false);
      setActiveId(null);
      setFarmer(null);
      setMessages([]);
      await loadConvs();
      show('Đã xóa cuộc trò chuyện.');
    } catch (e) {
      show((await explainApiError(e)).message, 'error', 6000);
    }
  };

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return q ? convs.filter((c) => c.fullName.toLowerCase().includes(q) || c.phone.includes(q)) : convs;
  }, [convs, query]);
  const totalUnread = convs.reduce((n, c) => n + c.unread, 0);

  return (
    <div className="flex h-[calc(100vh-3.5rem)] flex-col md:flex-row">
      {toast}

      {/* ===== Danh sách cuộc trò chuyện ===== */}
      <section className={`flex min-h-0 w-full flex-col border-slate-800 bg-slate-900 md:w-[340px] md:shrink-0 md:border-r ${activeId ? 'hidden md:flex' : 'flex'}`}>
        <div className="border-b border-slate-800 p-4">
          <h1 className="text-lg font-bold text-white">
            Hộp thoại {totalUnread > 0 && <span className="ml-1 rounded-full bg-red-500 px-2 py-0.5 text-xs">{totalUnread} chưa đọc</span>}
          </h1>
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Tìm theo tên hoặc số điện thoại" className="input mt-3" />
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto">
          {error && <div className="p-3"><Alert kind="error">{error}</Alert></div>}
          {loading ? (
            <LoadingBlock />
          ) : filtered.length === 0 ? (
            <div className="p-4">
              <EmptyState title={query ? 'Không tìm thấy' : 'Chưa có tin nhắn'}>{query ? 'Thử tìm bằng tên hoặc số điện thoại khác.' : 'Khi nông dân gửi câu hỏi, cuộc trò chuyện sẽ hiện ở đây.'}</EmptyState>
            </div>
          ) : (
            <ul className="divide-y divide-slate-800">
              {filtered.map((c) => (
                <li key={c.farmerId}>
                  <button onClick={() => open(c.farmerId)} className={`w-full px-4 py-3 text-left transition-colors hover:bg-slate-800 ${activeId === c.farmerId ? 'bg-slate-800' : ''}`}>
                    <div className="flex items-center justify-between gap-2">
                      <span className="truncate font-semibold text-white">{c.fullName}</span>
                      <span className="shrink-0 text-xs text-slate-500">{timeAgo(c.lastAt)}</span>
                    </div>
                    <p className="text-xs text-slate-400">{c.phone}{c.regionName ? ` · ${c.regionName}` : ''}</p>
                    <div className="mt-1 flex items-center justify-between gap-2">
                      <p className={`truncate text-sm ${c.unread ? 'font-semibold text-slate-100' : 'text-slate-400'}`}>
                        {c.lastFromFarmer ? '' : 'Bạn: '}
                        {c.lastMessage}
                      </p>
                      {c.unread > 0 && <span className="shrink-0 rounded-full bg-red-500 px-2 py-0.5 text-xs font-bold text-white">{c.unread}</span>}
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      {/* ===== Nội dung cuộc trò chuyện ===== */}
      <section className={`min-h-0 min-w-0 flex-1 flex-col ${activeId ? 'flex' : 'hidden md:flex'}`}>
        {activeId && farmer ? (
          <>
            <div className="flex items-center justify-between gap-3 border-b border-slate-800 bg-slate-900 px-4 py-3">
              <div className="flex min-w-0 items-center gap-3">
                <button onClick={() => setActiveId(null)} className="btn btn-secondary px-3 py-1.5 md:hidden">Danh sách</button>
                <div className="min-w-0">
                  <p className="truncate font-bold text-white">{farmer.fullName}</p>
                  <p className="text-xs text-slate-400">{farmer.phone}{farmer.regionName ? ` · ${farmer.regionName}` : ''}</p>
                </div>
              </div>
              <button onClick={() => setConfirmDelete(true)} className="btn btn-ghost px-3 py-1.5 text-red-300 hover:text-red-200">Xóa cuộc trò chuyện</button>
            </div>
            <div className="min-h-0 flex-1">
              <ChatThread
                messages={messages}
                loading={threadLoading}
                onSend={send}
                otherLabel={farmer.fullName}
                placeholder={`Trả lời ${farmer.fullName}...`}
                emptyText="Cuộc trò chuyện này chưa có tin nhắn."
              />
            </div>
          </>
        ) : (
          <div className="flex flex-1 items-center justify-center p-6">
            <EmptyState title="Chọn một cuộc trò chuyện">Chọn một nông dân ở danh sách bên trái để xem câu hỏi và trả lời.</EmptyState>
          </div>
        )}
      </section>

      <Modal open={confirmDelete} onClose={() => setConfirmDelete(false)} title="Xóa cuộc trò chuyện"
        footer={<><button className="btn btn-secondary" onClick={() => setConfirmDelete(false)}>Hủy</button><button className="btn btn-danger" onClick={removeConversation}>Xóa</button></>}>
        <p className="text-sm leading-relaxed text-slate-300">Toàn bộ tin nhắn giữa cơ quan quản lý và {farmer?.fullName} sẽ bị xóa vĩnh viễn, nông dân cũng không còn thấy nội dung này. Bạn có chắc chắn?</p>
      </Modal>
    </div>
  );
}

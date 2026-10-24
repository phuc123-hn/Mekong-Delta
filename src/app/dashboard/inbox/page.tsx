'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import api, { explainApiError } from '@/lib/api';
import { useRealtime } from '@/lib/realtime';
import { useAuthStore } from '@/store/auth-store';
import { regionName } from '@/data/mekong-regions';
import AnnouncementCard, { Announcement } from '@/components/announcement-card';
import ChatThread, { ChatMsg } from '@/components/chat-thread';
import { Alert, EmptyState, LoadingBlock, useToast } from '@/components/ui';

type Tab = 'announcements' | 'chat';
const SEEN_KEY = 'announcements-last-seen';

export default function FarmerInboxPage() {
  const { user } = useAuthStore();
  const { toast, show } = useToast();
  const [tab, setTab] = useState<Tab>('announcements');

  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [annLoading, setAnnLoading] = useState(true);
  const [annError, setAnnError] = useState('');
  const lastSeen = useRef<number>(0);

  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [chatLoading, setChatLoading] = useState(true);
  const [chatError, setChatError] = useState('');
  const tabRef = useRef<Tab>('announcements');
  tabRef.current = tab;

  // Mốc "đã xem" lần trước, để đánh dấu thông báo mới
  useEffect(() => {
    lastSeen.current = Number(localStorage.getItem(SEEN_KEY) || 0);
  }, []);

  const loadAnnouncements = useCallback(async () => {
    try {
      const res = await api.get('/api/messages/announcements');
      setAnnouncements(res.data.announcements || []);
      setAnnError('');
    } catch (e) {
      setAnnError((await explainApiError(e)).message);
    } finally {
      setAnnLoading(false);
    }
  }, []);

  const markRead = useCallback(() => api.post('/api/messages/thread/read').catch(() => undefined), []);

  const loadThread = useCallback(async () => {
    try {
      const res = await api.get('/api/messages/thread');
      setMessages(res.data.messages || []);
      setChatError('');
      if (tabRef.current === 'chat') markRead();
    } catch (e) {
      setChatError((await explainApiError(e)).message);
    } finally {
      setChatLoading(false);
    }
  }, [markRead]);

  useEffect(() => {
    loadAnnouncements();
    loadThread();
    const t = setInterval(() => {
      loadAnnouncements();
      loadThread();
    }, 20000);
    return () => clearInterval(t);
  }, [loadAnnouncements, loadThread]);

  useRealtime({
    announcement: () => {
      loadAnnouncements();
      show('Có thông báo chung mới từ cơ quan quản lý.', 'info');
    },
    chat_message: (d: any) => {
      if (d?.message) setMessages((prev) => (prev.some((m) => m.id === d.message.id) ? prev : [...prev, d.message]));
      if (tabRef.current === 'chat') markRead();
      else show('Cơ quan quản lý vừa trả lời tin nhắn của bạn.', 'info');
    },
  });

  // Mở tab trò chuyện -> đánh dấu đã đọc. Rời tab thông báo -> ghi nhận đã xem.
  useEffect(() => {
    if (tab === 'chat') markRead();
    if (tab === 'announcements' && announcements.length) {
      const t = setTimeout(() => localStorage.setItem(SEEN_KEY, String(Date.now())), 4000);
      return () => clearTimeout(t);
    }
  }, [tab, markRead, announcements.length]);

  const sendMessage = async (text: string) => {
    try {
      const res = await api.post('/api/messages/thread', { content: text });
      setMessages((prev) => [...prev, res.data.message]);
      setChatError('');
    } catch (e) {
      const msg = (await explainApiError(e)).message;
      show(msg, 'error', 6000);
      throw e;
    }
  };

  const myProvince = regionName(user?.region);
  const newCount = announcements.filter((a) => new Date(a.createdAt).getTime() > lastSeen.current).length;

  return (
    <div className="flex h-[calc(100vh-3.5rem)] flex-col">
      {toast}
      <div className="shrink-0 border-b border-slate-800 bg-slate-900 px-4 pt-5 md:px-8">
        <h1 className="page-title">Tin nhắn</h1>
        <p className="page-sub">Xem thông báo chung và trao đổi trực tiếp với cơ quan quản lý.</p>
        <div className="mt-4 flex gap-1" role="tablist">
          {([
            ['announcements', 'Thông báo chung', newCount],
            ['chat', 'Hỏi cơ quan quản lý', 0],
          ] as [Tab, string, number][]).map(([k, label, badge]) => (
            <button
              key={k}
              role="tab"
              aria-selected={tab === k}
              onClick={() => setTab(k)}
              className={`rounded-t-lg border-b-2 px-4 py-2.5 text-sm font-semibold transition-colors ${tab === k ? 'border-cyan-500 text-white' : 'border-transparent text-slate-400 hover:text-white'}`}
            >
              {label}
              {badge > 0 && <span className="ml-2 rounded-full bg-cyan-600 px-2 py-0.5 text-xs text-white">{badge} mới</span>}
            </button>
          ))}
        </div>
      </div>

      {tab === 'announcements' ? (
        <div className="min-h-0 flex-1 overflow-y-auto">
          <div className="page space-y-4">
            <p className="text-sm text-slate-400">
              {myProvince ? `Bạn đang xem thông báo toàn vùng và thông báo của ${myProvince}.` : 'Bạn đang xem tất cả thông báo của cơ quan quản lý.'}
            </p>
            {annError && <Alert kind="error">{annError}</Alert>}
            {annLoading ? (
              <LoadingBlock />
            ) : announcements.length === 0 ? (
              <EmptyState title="Chưa có thông báo nào">Khi cơ quan quản lý đăng cảnh báo hoặc cập nhật số liệu, thông báo sẽ hiện ở đây.</EmptyState>
            ) : (
              announcements.map((a) => <AnnouncementCard key={a.id} a={a} isNew={new Date(a.createdAt).getTime() > lastSeen.current} />)
            )}
          </div>
        </div>
      ) : (
        <div className="min-h-0 flex-1">
          {chatError && (
            <div className="p-4 pb-0">
              <Alert kind="error">{chatError}</Alert>
            </div>
          )}
          <div className="mx-auto h-full max-w-3xl">
            <ChatThread
              messages={messages}
              loading={chatLoading}
              onSend={sendMessage}
              otherLabel="Cơ quan quản lý"
              placeholder="Nhập câu hỏi hoặc báo tình hình tại địa phương của bạn..."
              emptyText="Bạn chưa có tin nhắn nào. Hãy hỏi về độ mặn, lịch xuống giống hoặc báo thiệt hại. Cán bộ sẽ trả lời tại đây."
              suggestions={[
                'Độ mặn tại tỉnh của tôi hiện nay có an toàn để lấy nước không?',
                'Tôi muốn báo cáo thiệt hại do mặn trên ruộng của gia đình.',
                'Khi nào nên xuống giống vụ tới?',
              ]}
            />
          </div>
        </div>
      )}
    </div>
  );
}

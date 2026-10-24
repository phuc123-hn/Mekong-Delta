'use client';

import { useCallback, useEffect, useState } from 'react';
import api, { explainApiError } from '@/lib/api';
import { useAuthStore } from '@/store/auth-store';
import { MEKONG_REGIONS, regionName } from '@/data/mekong-regions';
import { Alert, EmptyState, LoadingBlock, Modal, PageHeader, Spinner, useToast } from '@/components/ui';

interface ManagedUser {
  id: string;
  fullName: string;
  phone: string;
  email: string | null;
  emailVerified: boolean;
  role: 'FARMER' | 'GOVERNMENT';
  region: string | null;
  createdAt: string;
}

type RoleFilter = '' | 'FARMER' | 'GOVERNMENT';
const ROLE_LABEL = { FARMER: 'Nông dân', GOVERNMENT: 'Cơ quan quản lý' } as const;
const PHONE_RE = /^0\d{9}$/;

export default function GovUsersPage() {
  const me = useAuthStore((s) => s.user);
  const { toast, show } = useToast();

  const [users, setUsers] = useState<ManagedUser[]>([]);
  const [totals, setTotals] = useState({ FARMER: 0, GOVERNMENT: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [role, setRole] = useState<RoleFilter>('');
  const [q, setQ] = useState('');
  const [debouncedQ, setDebouncedQ] = useState('');

  const [editing, setEditing] = useState<ManagedUser | null>(null);
  const [form, setForm] = useState({ fullName: '', phone: '', email: '', role: 'FARMER' as 'FARMER' | 'GOVERNMENT', region: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<ManagedUser | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedQ(q), 300);
    return () => clearTimeout(t);
  }, [q]);

  const load = useCallback(async () => {
    try {
      const res = await api.get('/api/users', { params: { role: role || undefined, q: debouncedQ || undefined } });
      setUsers(res.data.users || []);
      setTotals(res.data.totals || { FARMER: 0, GOVERNMENT: 0 });
      setError('');
    } catch (e) {
      setError((await explainApiError(e)).message);
    } finally {
      setLoading(false);
    }
  }, [role, debouncedQ]);

  useEffect(() => {
    setLoading(true);
    load();
  }, [load]);

  const openEdit = (u: ManagedUser) => {
    setEditing(u);
    setErrors({});
    setForm({ fullName: u.fullName, phone: u.phone, email: u.email ?? '', role: u.role, region: u.region ?? '' });
  };

  const save = async () => {
    if (!editing) return;
    const e: Record<string, string> = {};
    if (form.fullName.trim().length < 2) e.fullName = 'Họ tên phải có ít nhất 2 ký tự.';
    if (!PHONE_RE.test(form.phone)) e.phone = 'Số điện thoại phải gồm đúng 10 chữ số và bắt đầu bằng số 0.';
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(form.email)) e.email = 'Địa chỉ email không hợp lệ.';
    setErrors(e);
    if (Object.keys(e).length) return;

    setSaving(true);
    try {
      await api.put(`/api/users/${editing.id}`, { ...form, email: form.email.trim(), region: form.region });
      setEditing(null);
      await load();
      show('Đã cập nhật thông tin người dùng.');
    } catch (err) {
      const i = await explainApiError(err);
      setErrors({ [i.field || 'form']: i.message });
    } finally {
      setSaving(false);
    }
  };

  const remove = async () => {
    if (!deleting) return;
    setBusy(true);
    try {
      const res = await api.delete(`/api/users/${deleting.id}`);
      show(res.data.message || 'Đã xóa người dùng.');
      setDeleting(null);
      await load();
    } catch (err) {
      show((await explainApiError(err)).message, 'error', 6000);
      setDeleting(null);
    } finally {
      setBusy(false);
    }
  };

  const isMe = (u: ManagedUser) => u.id === (me?.id || me?.userId);

  return (
    <div className="page">
      {toast}
      <PageHeader title="Quản lý người dùng" subtitle="Xem, chỉnh sửa thông tin và xóa tài khoản. Người dùng tự đăng ký tài khoản mới bằng email nên không có chức năng thêm." />

      <div className="mb-5 grid gap-3 sm:grid-cols-3">
        {[
          { k: '' as RoleFilter, label: 'Tất cả tài khoản', n: totals.FARMER + totals.GOVERNMENT },
          { k: 'FARMER' as RoleFilter, label: 'Nông dân', n: totals.FARMER },
          { k: 'GOVERNMENT' as RoleFilter, label: 'Cơ quan quản lý', n: totals.GOVERNMENT },
        ].map((c) => (
          <button key={c.label} onClick={() => setRole(c.k)} className={`card p-4 text-left transition-colors hover:border-cyan-600 ${role === c.k ? 'border-cyan-500 bg-slate-800' : ''}`}>
            <p className="text-sm text-slate-400">{c.label}</p>
            <p className="mt-1 text-3xl font-bold text-white">{c.n}</p>
          </button>
        ))}
      </div>

      <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Tìm theo họ tên, số điện thoại hoặc email" className="input mb-4 max-w-md" />
      {error && <div className="mb-4"><Alert kind="error" action={<button className="btn btn-secondary px-3 py-1" onClick={load}>Thử lại</button>}>{error}</Alert></div>}

      {loading ? (
        <LoadingBlock />
      ) : users.length === 0 ? (
        <EmptyState title="Không có người dùng phù hợp">Thử đổi bộ lọc hoặc từ khóa tìm kiếm.</EmptyState>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-800">
          <table className="w-full min-w-[820px] text-left text-sm">
            <thead className="bg-slate-900 text-xs text-slate-400">
              <tr>
                {['Họ và tên', 'Số điện thoại', 'Email', 'Vai trò', 'Tỉnh', 'Ngày tạo', 'Thao tác'].map((h) => <th key={h} className="px-4 py-3 font-semibold">{h}</th>)}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-slate-900/60">
                  <td className="px-4 py-3 font-medium text-white">{u.fullName}{isMe(u) && <span className="ml-2 text-xs text-cyan-300">(bạn)</span>}</td>
                  <td className="px-4 py-3 text-slate-300">{u.phone}</td>
                  <td className="px-4 py-3 text-slate-300">{u.email ? <>{u.email}{u.emailVerified && <span className="ml-2 text-xs text-emerald-400">đã xác thực</span>}</> : <span className="text-slate-500">Chưa có</span>}</td>
                  <td className="px-4 py-3"><span className={`badge ${u.role === 'GOVERNMENT' ? 'border-purple-500/40 bg-purple-500/15 text-purple-200' : 'border-emerald-500/40 bg-emerald-500/15 text-emerald-200'}`}>{ROLE_LABEL[u.role]}</span></td>
                  <td className="px-4 py-3 text-slate-300">{regionName(u.region) || <span className="text-slate-500">Chưa gán</span>}</td>
                  <td className="px-4 py-3 text-xs text-slate-400">{new Date(u.createdAt).toLocaleDateString('vi-VN')}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button onClick={() => openEdit(u)} className="btn btn-secondary px-3 py-1.5 text-xs">Sửa thông tin</button>
                      <button onClick={() => setDeleting(u)} disabled={isMe(u)} title={isMe(u) ? 'Không thể xóa tài khoản đang đăng nhập' : undefined} className="btn btn-ghost px-3 py-1.5 text-xs text-red-300 hover:text-red-200">Xóa</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ===== Sửa thông tin ===== */}
      <Modal open={!!editing} onClose={() => setEditing(null)} title="Chỉnh sửa thông tin người dùng"
        footer={<><button className="btn btn-secondary" onClick={() => setEditing(null)}>Hủy</button><button className="btn btn-primary" onClick={save} disabled={saving}>{saving && <Spinner size={16} />} Lưu thay đổi</button></>}>
        <div className="space-y-4">
          {errors.form && <Alert kind="error">{errors.form}</Alert>}
          <div>
            <label className="label" htmlFor="u-name">Họ và tên</label>
            <input id="u-name" className={`input ${errors.fullName ? 'input-error' : ''}`} value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} />
            {errors.fullName && <p className="field-error">{errors.fullName}</p>}
          </div>
          <div>
            <label className="label" htmlFor="u-phone">Số điện thoại (10 số)</label>
            <input id="u-phone" inputMode="numeric" maxLength={10} className={`input ${errors.phone ? 'input-error' : ''}`} value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value.replace(/\D/g, '').slice(0, 10) })} />
            {errors.phone && <p className="field-error">{errors.phone}</p>}
          </div>
          <div>
            <label className="label" htmlFor="u-email">Email</label>
            <input id="u-email" type="email" className={`input ${errors.email ? 'input-error' : ''}`} value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            {errors.email && <p className="field-error">{errors.email}</p>}
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="label" htmlFor="u-role">Vai trò</label>
              <select id="u-role" className="input" value={form.role} disabled={editing ? isMe(editing) : false} onChange={(e) => setForm({ ...form, role: e.target.value as 'FARMER' | 'GOVERNMENT' })}>
                <option value="FARMER">Nông dân</option>
                <option value="GOVERNMENT">Cơ quan quản lý</option>
              </select>
              {editing && isMe(editing) && <p className="mt-1 text-xs text-slate-500">Không thể tự đổi vai trò của chính mình.</p>}
              {errors.role && <p className="field-error">{errors.role}</p>}
            </div>
            <div>
              <label className="label" htmlFor="u-region">Tỉnh, thành</label>
              <select id="u-region" className="input" value={form.region} onChange={(e) => setForm({ ...form, region: e.target.value })}>
                <option value="">Chưa gán</option>
                {MEKONG_REGIONS.map((r) => <option key={r.code} value={r.code}>{r.name}</option>)}
              </select>
            </div>
          </div>
          <p className="text-xs leading-relaxed text-slate-500">Tỉnh được gán dùng để nông dân nhận thông báo đúng khu vực và mở bản đồ đúng tỉnh của mình.</p>
        </div>
      </Modal>

      {/* ===== Xóa ===== */}
      <Modal open={!!deleting} onClose={() => setDeleting(null)} title="Xóa người dùng"
        footer={<><button className="btn btn-secondary" onClick={() => setDeleting(null)}>Hủy</button><button className="btn btn-danger" onClick={remove} disabled={busy}>{busy && <Spinner size={16} />} Xóa tài khoản</button></>}>
        <p className="text-sm leading-relaxed text-slate-300">
          Tài khoản <b className="text-white">{deleting?.fullName}</b> ({deleting?.phone}) sẽ bị xóa vĩnh viễn cùng các cuộc trò chuyện riêng của người này. Thông báo chung đã phát hành vẫn được giữ lại. Hành động này không thể hoàn tác.
        </p>
      </Modal>
    </div>
  );
}

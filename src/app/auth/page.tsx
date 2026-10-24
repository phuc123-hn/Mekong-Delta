'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import api, { explainApiError } from '@/lib/api';
import { useAuthStore } from '@/store/auth-store';
import { Alert, Spinner } from '@/components/ui';

type Tab = 'login' | 'register';
type Step = 'form' | 'otp';
type Role = 'FARMER' | 'GOVERNMENT';

const PHONE_RE = /^0\d{9}$/; // đúng 10 chữ số, bắt đầu bằng 0
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const OTP_LENGTH = 6;

const digitsOnly = (v: string, max: number) => v.replace(/\D/g, '').slice(0, max);

export default function AuthPage() {
  const router = useRouter();
  const login = useAuthStore((s) => s.login);

  const [tab, setTab] = useState<Tab>('login');
  const [step, setStep] = useState<Step>('form');

  // Trường dùng chung / đăng ký
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState<Role>('FARMER');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  // Thông báo
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  // OTP
  const [otp, setOtp] = useState('');
  const [maskedEmail, setMaskedEmail] = useState('');
  const [expiresAt, setExpiresAt] = useState(0);
  const [attemptsLeft, setAttemptsLeft] = useState(2);
  const [sendLockUntil, setSendLockUntil] = useState(0); // khóa nút "Gửi lại mã"
  const [verifyLockUntil, setVerifyLockUntil] = useState(0); // khóa ô nhập mã sau khi sai quá số lần
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    if (typeof window !== 'undefined' && new URLSearchParams(window.location.search).has('expired')) {
      setInfo('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
    }
  }, []);

  // Đồng hồ đếm ngược chỉ chạy khi cần
  const needsClock = step === 'otp' && tab === 'register';
  useEffect(() => {
    if (!needsClock) return;
    const t = setInterval(() => setNow(Date.now()), 500);
    return () => clearInterval(t);
  }, [needsClock]);

  const secLeft = (until: number) => Math.max(0, Math.ceil((until - now) / 1000));
  const otpSeconds = secLeft(expiresAt);
  const otpExpired = expiresAt > 0 && otpSeconds === 0;
  const sendLockSec = secLeft(sendLockUntil);
  const verifyLockSec = secLeft(verifyLockUntil);

  const resetMessages = () => {
    setError('');
    setInfo('');
    setSuccess('');
    setFieldErrors({});
  };

  const switchTab = (t: Tab) => {
    setTab(t);
    setStep('form');
    resetMessages();
    setOtp('');
  };

  // ------------------------------------------------------------------ Kiểm tra dữ liệu phía trình duyệt
  const validateRegisterForm = () => {
    const e: Record<string, string> = {};
    if (fullName.trim().length < 2) e.fullName = 'Vui lòng nhập họ tên (ít nhất 2 ký tự).';
    if (!PHONE_RE.test(phone)) e.phone = 'Số điện thoại phải gồm đúng 10 chữ số và bắt đầu bằng số 0.';
    if (!EMAIL_RE.test(email.trim())) e.email = 'Địa chỉ email không hợp lệ. Ví dụ: ten@gmail.com';
    if (password.length < 8) e.password = 'Mật khẩu phải có ít nhất 8 ký tự.';
    if (confirm !== password) e.confirm = 'Mật khẩu nhập lại không khớp.';
    setFieldErrors(e);
    return Object.keys(e).length === 0;
  };

  // ------------------------------------------------------------------ Đăng nhập
  const handleLogin = async (ev: React.FormEvent) => {
    ev.preventDefault();
    resetMessages();
    const e: Record<string, string> = {};
    if (!PHONE_RE.test(phone)) e.phone = 'Số điện thoại phải gồm đúng 10 chữ số và bắt đầu bằng số 0.';
    if (!password) e.password = 'Vui lòng nhập mật khẩu.';
    if (Object.keys(e).length) return setFieldErrors(e);

    setLoading(true);
    try {
      await login(phone, password);
      const role = useAuthStore.getState().user?.role;
      router.push(role === 'GOVERNMENT' ? '/gov' : '/dashboard');
    } catch (err: any) {
      const infoErr = err?.info;
      setError(infoErr?.message || err.message || 'Đăng nhập thất bại.');
      if (infoErr?.field) setFieldErrors({ [infoErr.field]: infoErr.message });
    } finally {
      setLoading(false);
    }
  };

  // ------------------------------------------------------------------ Đăng ký bước 1: gửi mã
  const requestOtp = useCallback(
    async (fromForm: boolean) => {
      resetMessages();
      if (fromForm && !validateRegisterForm()) return;
      setLoading(true);
      try {
        const res = await api.post('/api/auth/register/request-otp', {
          fullName: fullName.trim(),
          phone,
          email: email.trim(),
          password,
          role,
        });
        const d = res.data;
        setMaskedEmail(d.maskedEmail);
        setExpiresAt(Date.now() + d.expiresInSec * 1000);
        setAttemptsLeft(d.maxAttempts ?? 2);
        setSendLockUntil(0);
        setVerifyLockUntil(0);
        setOtp('');
        setNow(Date.now());
        setStep('otp');
        setInfo(d.message);
      } catch (err) {
        const i = await explainApiError(err);
        setError(i.message);
        if (i.field) setFieldErrors({ [i.field]: i.message });
        if (i.retryAfterSec) {
          const until = Date.now() + i.retryAfterSec * 1000;
          setNow(Date.now());
          if (i.code === 'RATE_LIMITED_VERIFY_LOCKED') setVerifyLockUntil(until);
          setSendLockUntil(until);
        }
        // Lỗi ở trường nào thì quay lại form để sửa
        if (i.field && step === 'otp') setStep('form');
      } finally {
        setLoading(false);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [fullName, phone, email, password, confirm, role, step]
  );

  // ------------------------------------------------------------------ Đăng ký bước 2: xác thực mã
  const verifyOtp = async (ev: React.FormEvent) => {
    ev.preventDefault();
    resetMessages();
    if (otp.length !== OTP_LENGTH) return setError(`Mã xác thực gồm đúng ${OTP_LENGTH} chữ số.`);

    setLoading(true);
    try {
      const res = await api.post('/api/auth/register/verify-otp', { email: email.trim(), otp });
      setSuccess(res.data.message || 'Đăng ký thành công! Vui lòng đăng nhập.');
      // Quay về trang đăng nhập, điền sẵn số điện thoại
      const registeredPhone = res.data.phone || phone;
      setTimeout(() => {
        setTab('login');
        setStep('form');
        setPhone(registeredPhone);
        setPassword('');
        setConfirm('');
        setOtp('');
        setFullName('');
        setEmail('');
        setInfo('Đăng ký thành công. Hãy đăng nhập bằng số điện thoại và mật khẩu vừa tạo.');
        setSuccess('');
      }, 2200);
    } catch (err) {
      const i = await explainApiError(err);
      setError(i.message);
      setOtp('');
      setNow(Date.now());
      if (typeof i.attemptsLeft === 'number') setAttemptsLeft(i.attemptsLeft);
      if (i.code === 'OTP_RATE_LIMITED' && i.retryAfterSec) {
        const until = Date.now() + i.retryAfterSec * 1000;
        setVerifyLockUntil(until);
        setSendLockUntil(until);
        setAttemptsLeft(0);
        setExpiresAt(0);
      }
      if (i.code === 'OTP_EXPIRED') setExpiresAt(Date.now() - 1);
      if (i.code === 'NO_PENDING') setStep('form');
    } finally {
      setLoading(false);
    }
  };

  const pwType = showPw ? 'text' : 'password';
  const otpDisabled = verifyLockSec > 0 || otpExpired || loading || !!success;
  const canResend = sendLockSec === 0 && verifyLockSec === 0 && !loading && !success;

  const err = (k: string) => fieldErrors[k];
  const inputCls = (k: string) => `input ${err(k) ? 'input-error' : ''}`;

  const passwordStrength = useMemo(() => {
    let s = 0;
    if (password.length >= 8) s++;
    if (/[A-Z]/.test(password) && /[a-z]/.test(password)) s++;
    if (/\d/.test(password)) s++;
    if (/[^A-Za-z0-9]/.test(password)) s++;
    return s;
  }, [password]);

  return (
    <div className="flex min-h-screen items-center justify-center overflow-y-auto bg-slate-950 px-4 py-10">
      <div className="w-full max-w-md">
        <div className="mb-6 text-center">
          <Link href="/" className="text-sm text-slate-400 hover:text-cyan-300">
            Về trang chủ
          </Link>
          <h1 className="mt-3 text-3xl font-bold text-white">Delta Stress Lens</h1>
          <p className="mt-1 text-sm text-slate-400">Giám sát rủi ro môi trường Đồng bằng sông Cửu Long</p>
        </div>

        <div className="card p-6 shadow-2xl">
          {/* Chuyển tab */}
          <div className="mb-6 grid grid-cols-2 gap-1 rounded-lg bg-slate-950 p-1" role="tablist">
            {(['login', 'register'] as Tab[]).map((t) => (
              <button
                key={t}
                role="tab"
                aria-selected={tab === t}
                onClick={() => switchTab(t)}
                className={`rounded-md py-2 text-sm font-semibold transition-colors ${tab === t ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-white'}`}
              >
                {t === 'login' ? 'Đăng nhập' : 'Đăng ký'}
              </button>
            ))}
          </div>

          <div className="mb-4 space-y-3">
            {success && <Alert kind="success" title="Đăng ký thành công">{success} Đang chuyển về trang đăng nhập...</Alert>}
            {error && <Alert kind="error">{error}</Alert>}
            {info && !error && !success && <Alert kind="info">{info}</Alert>}
          </div>

          {/* ================= ĐĂNG NHẬP ================= */}
          {tab === 'login' && (
            <form onSubmit={handleLogin} className="space-y-4" noValidate>
              <div>
                <label className="label" htmlFor="l-phone">Số điện thoại</label>
                <input id="l-phone" type="tel" inputMode="numeric" autoComplete="username" maxLength={10} value={phone}
                  onChange={(e) => setPhone(digitsOnly(e.target.value, 10))} placeholder="0909123456" className={inputCls('phone')} />
                {err('phone') && <p className="field-error">{err('phone')}</p>}
              </div>
              <div>
                <label className="label" htmlFor="l-pw">Mật khẩu</label>
                <div className="relative">
                  <input id="l-pw" type={pwType} autoComplete="current-password" value={password}
                    onChange={(e) => setPassword(e.target.value)} placeholder="Nhập mật khẩu" className={`${inputCls('password')} pr-16`} />
                  <button type="button" onClick={() => setShowPw((v) => !v)} className="absolute inset-y-0 right-0 px-3 text-xs font-semibold text-slate-400 hover:text-white">
                    {showPw ? 'Ẩn' : 'Hiện'}
                  </button>
                </div>
                {err('password') && <p className="field-error">{err('password')}</p>}
              </div>
              <button type="submit" disabled={loading} className="btn btn-primary w-full py-2.5">
                {loading && <Spinner size={16} />} Đăng nhập
              </button>
              <p className="text-center text-sm text-slate-400">
                Chưa có tài khoản?{' '}
                <button type="button" onClick={() => switchTab('register')} className="font-semibold text-cyan-400 hover:text-cyan-300">
                  Đăng ký ngay
                </button>
              </p>
            </form>
          )}

          {/* ================= ĐĂNG KÝ - BƯỚC 1 ================= */}
          {tab === 'register' && step === 'form' && (
            <form onSubmit={(e) => { e.preventDefault(); requestOtp(true); }} className="space-y-4" noValidate>
              <div>
                <label className="label" htmlFor="r-name">Họ và tên</label>
                <input id="r-name" type="text" autoComplete="name" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Nguyễn Văn A" className={inputCls('fullName')} />
                {err('fullName') && <p className="field-error">{err('fullName')}</p>}
              </div>
              <div>
                <label className="label" htmlFor="r-role">Loại tài khoản</label>
                <select id="r-role" value={role} onChange={(e) => setRole(e.target.value as Role)} className="input">
                  <option value="FARMER">Nông dân</option>
                  <option value="GOVERNMENT">Cơ quan quản lý (Chính phủ)</option>
                </select>
              </div>
              <div>
                <label className="label" htmlFor="r-phone">Số điện thoại (10 số)</label>
                <input id="r-phone" type="tel" inputMode="numeric" autoComplete="tel" maxLength={10} value={phone}
                  onChange={(e) => setPhone(digitsOnly(e.target.value, 10))} placeholder="0909123456" className={inputCls('phone')} />
                <div className="mt-1 flex justify-between text-xs">
                  <span className="field-error !mt-0">{err('phone')}</span>
                  <span className={phone.length === 10 ? 'text-emerald-400' : 'text-slate-500'}>{phone.length}/10</span>
                </div>
              </div>
              <div>
                <label className="label" htmlFor="r-email">Email (nhận mã xác thực)</label>
                <input id="r-email" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="ten@gmail.com" className={inputCls('email')} />
                {err('email') && <p className="field-error">{err('email')}</p>}
              </div>
              <div>
                <label className="label" htmlFor="r-pw">Mật khẩu (ít nhất 8 ký tự)</label>
                <div className="relative">
                  <input id="r-pw" type={pwType} autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} className={`${inputCls('password')} pr-16`} />
                  <button type="button" onClick={() => setShowPw((v) => !v)} className="absolute inset-y-0 right-0 px-3 text-xs font-semibold text-slate-400 hover:text-white">
                    {showPw ? 'Ẩn' : 'Hiện'}
                  </button>
                </div>
                {password && (
                  <div className="mt-2 flex gap-1" aria-hidden>
                    {[0, 1, 2, 3].map((i) => (
                      <span key={i} className={`h-1 flex-1 rounded ${i < passwordStrength ? (passwordStrength <= 1 ? 'bg-red-500' : passwordStrength <= 2 ? 'bg-yellow-500' : 'bg-emerald-500') : 'bg-slate-700'}`} />
                    ))}
                  </div>
                )}
                {err('password') && <p className="field-error">{err('password')}</p>}
              </div>
              <div>
                <label className="label" htmlFor="r-cf">Nhập lại mật khẩu</label>
                <input id="r-cf" type={pwType} autoComplete="new-password" value={confirm} onChange={(e) => setConfirm(e.target.value)} className={inputCls('confirm')} />
                {err('confirm') && <p className="field-error">{err('confirm')}</p>}
              </div>
              <button type="submit" disabled={loading || sendLockSec > 0} className="btn btn-primary w-full py-2.5">
                {loading && <Spinner size={16} />} {sendLockSec > 0 ? `Thử lại sau ${sendLockSec} giây` : 'Gửi mã xác thực về email'}
              </button>
            </form>
          )}

          {/* ================= ĐĂNG KÝ - BƯỚC 2: NHẬP OTP ================= */}
          {tab === 'register' && step === 'otp' && (
            <form onSubmit={verifyOtp} className="space-y-4" noValidate>
              <div className="rounded-lg bg-slate-950 p-4 text-sm text-slate-300">
                Mã xác thực gồm {OTP_LENGTH} chữ số đã được gửi đến <span className="font-semibold text-white">{maskedEmail}</span>. Hãy kiểm tra cả mục Thư rác (Spam) nếu chưa thấy.
              </div>

              <div>
                <label className="label" htmlFor="otp">Mã xác thực</label>
                <input id="otp" type="text" inputMode="numeric" autoComplete="one-time-code" maxLength={OTP_LENGTH} value={otp}
                  onChange={(e) => setOtp(digitsOnly(e.target.value, OTP_LENGTH))} disabled={otpDisabled} autoFocus
                  placeholder="------" className="input text-center text-2xl font-bold tracking-[0.5em]" />
              </div>

              <div className="flex items-center justify-between text-sm">
                {verifyLockSec > 0 ? (
                  <span className="font-semibold text-red-400">Bị khóa nhập mã. Thử lại sau {verifyLockSec} giây</span>
                ) : otpExpired ? (
                  <span className="font-semibold text-red-400">Mã đã hết hạn. Hãy bấm Gửi lại mã</span>
                ) : (
                  <span className={otpSeconds <= 10 ? 'font-semibold text-yellow-400' : 'text-slate-300'}>
                    Mã hết hạn sau 0:{String(otpSeconds).padStart(2, '0')}
                  </span>
                )}
                <span className="text-slate-400">Còn {attemptsLeft} lần nhập</span>
              </div>

              <button type="submit" disabled={otpDisabled || otp.length !== OTP_LENGTH} className="btn btn-primary w-full py-2.5">
                {loading && <Spinner size={16} />} Xác nhận và đăng ký
              </button>

              <div className="flex items-center justify-between gap-3">
                <button type="button" onClick={() => { setStep('form'); resetMessages(); }} className="text-sm text-slate-400 hover:text-white">
                  Sửa thông tin
                </button>
                <button type="button" onClick={() => requestOtp(false)} disabled={!canResend} className="btn btn-secondary px-3 py-1.5">
                  {sendLockSec > 0 || verifyLockSec > 0 ? `Gửi lại mã (${Math.max(sendLockSec, verifyLockSec)}s)` : 'Gửi lại mã'}
                </button>
              </div>
              <p className="text-xs text-slate-500">
                Chỉ bấm Gửi lại mã một lần. Bấm liên tục nhiều lần sẽ bị khóa chức năng gửi mã trong 15 giây.
              </p>
            </form>
          )}
        </div>

        <p className="mt-6 text-center text-xs text-slate-500">Cần hỗ trợ? Gọi hotline 0767248775</p>
      </div>
    </div>
  );
}

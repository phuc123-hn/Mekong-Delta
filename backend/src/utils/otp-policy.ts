import crypto from 'crypto';
import { OTP } from '../config/security';

/**
 * Logic OTP thuần (không phụ thuộc DB) để dễ kiểm thử.
 * Mọi hàm nhận state + thời điểm `now` và trả về state MỚI, không sửa state cũ.
 *
 * Quy tắc:
 *  - OTP sống 45 giây.
 *  - Được nhập tối đa 2 lần. Sai lần 1 -> được nhập lần 2. Sai lần 2 -> rate limit 60 giây (mã bị hủy).
 *  - Bấm "Gửi mã" 1 lần: gửi bình thường. Bấm lại quá nhanh (dưới 5 giây) -> khóa chức năng gửi 15 giây.
 */
export interface OtpState {
  codeHash: string | null;
  expiresAt: number; // ms epoch, 0 = chưa có mã
  attempts: number; // số lần nhập sai với mã hiện tại
  lastSentAt: number; // ms epoch, 0 = chưa gửi
  sendCount: number;
  sendLockedUntil: number;
  verifyLockedUntil: number;
}

export const emptyOtpState = (): OtpState => ({
  codeHash: null,
  expiresAt: 0,
  attempts: 0,
  lastSentAt: 0,
  sendCount: 0,
  sendLockedUntil: 0,
  verifyLockedUntil: 0,
});

const secondsLeft = (until: number, now: number) => Math.max(1, Math.ceil((until - now) / 1000));

export function generateCode(): string {
  return String(crypto.randomInt(0, 10 ** OTP.LENGTH)).padStart(OTP.LENGTH, '0');
}

export function hashCode(code: string, salt: string, secret: string): string {
  return crypto.createHmac('sha256', secret).update(`${salt}:${code}`).digest('hex');
}

function safeEqual(a: string, b: string): boolean {
  const ba = Buffer.from(a, 'hex');
  const bb = Buffer.from(b, 'hex');
  return ba.length === bb.length && crypto.timingSafeEqual(ba, bb);
}

// ---------------------------------------------------------------- GỬI MÃ
export type SendDecision =
  | { ok: true; state: OtpState }
  | { ok: false; reason: 'VERIFY_LOCKED' | 'SEND_LOCKED' | 'TOO_FAST' | 'TOO_MANY'; retryAfterSec: number; state: OtpState };

/**
 * Kiểm tra có được phép gửi mã lúc này không.
 * Nếu được: trả state đã "giữ chỗ" lượt gửi (lastSentAt, sendCount) để chặn bấm đồng thời.
 */
export function requestSend(state: OtpState, now: number): SendDecision {
  if (state.verifyLockedUntil > now) {
    return { ok: false, reason: 'VERIFY_LOCKED', retryAfterSec: secondsLeft(state.verifyLockedUntil, now), state };
  }
  if (state.sendLockedUntil > now) {
    return { ok: false, reason: 'SEND_LOCKED', retryAfterSec: secondsLeft(state.sendLockedUntil, now), state };
  }
  if (state.sendCount >= OTP.MAX_SENDS_PER_SESSION) {
    return { ok: false, reason: 'TOO_MANY', retryAfterSec: 0, state };
  }
  if (state.lastSentAt && now - state.lastSentAt < OTP.RESEND_MIN_INTERVAL_MS) {
    const locked = { ...state, sendLockedUntil: now + OTP.RESEND_LOCK_MS };
    return { ok: false, reason: 'TOO_FAST', retryAfterSec: Math.ceil(OTP.RESEND_LOCK_MS / 1000), state: locked };
  }
  return { ok: true, state: { ...state, lastSentAt: now, sendCount: state.sendCount + 1 } };
}

/** Gọi SAU KHI email đã gửi xong: bắt đầu tính 45 giây từ lúc này. */
export function issueCode(state: OtpState, codeHash: string, now: number): OtpState {
  return { ...state, codeHash, expiresAt: now + OTP.TTL_MS, attempts: 0 };
}

// ---------------------------------------------------------------- NHẬP MÃ
export type CheckResult =
  | { status: 'OK'; state: OtpState }
  | { status: 'NO_CODE'; state: OtpState }
  | { status: 'EXPIRED'; state: OtpState }
  | { status: 'WRONG'; attemptsLeft: number; state: OtpState }
  | { status: 'RATE_LIMITED'; retryAfterSec: number; state: OtpState };

export function checkCode(state: OtpState, submittedHash: string, now: number): CheckResult {
  if (state.verifyLockedUntil > now) {
    return { status: 'RATE_LIMITED', retryAfterSec: secondsLeft(state.verifyLockedUntil, now), state };
  }
  if (!state.codeHash) return { status: 'NO_CODE', state };

  if (now > state.expiresAt) {
    return { status: 'EXPIRED', state: { ...state, codeHash: null, expiresAt: 0, attempts: 0 } };
  }

  if (safeEqual(state.codeHash, submittedHash)) {
    return { status: 'OK', state: { ...state, codeHash: null, expiresAt: 0, attempts: 0 } };
  }

  const attempts = state.attempts + 1;
  if (attempts >= OTP.MAX_ATTEMPTS) {
    // Sai lần cuối: hủy mã + khóa
    const locked: OtpState = {
      ...state,
      codeHash: null,
      expiresAt: 0,
      attempts: 0,
      verifyLockedUntil: now + OTP.VERIFY_LOCK_MS,
    };
    return { status: 'RATE_LIMITED', retryAfterSec: Math.ceil(OTP.VERIFY_LOCK_MS / 1000), state: locked };
  }
  return { status: 'WRONG', attemptsLeft: OTP.MAX_ATTEMPTS - attempts, state: { ...state, attempts } };
}

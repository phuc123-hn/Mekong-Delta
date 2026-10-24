/**
 * Các hằng số bảo mật cho đăng ký bằng OTP email.
 * Muốn đổi thời gian / số lần thử chỉ cần sửa tại đây.
 */
export const OTP = {
  LENGTH: 6,
  /** Mã OTP có hiệu lực 45 giây */
  TTL_MS: 45_000,
  /** Cho phép nhập tối đa 2 lần. Sai lần 2 -> rate limit */
  MAX_ATTEMPTS: 2,
  /** Thời gian khóa nhập mã (và khóa gửi mã) sau khi sai lần 2 */
  VERIFY_LOCK_MS: 60_000,
  /** Bấm "Gửi mã" lần 2 trong vòng khoảng này kể từ lần gửi trước = bấm dồn dập */
  RESEND_MIN_INTERVAL_MS: 5_000,
  /** Bấm dồn dập -> khóa chức năng gửi mã 15 giây */
  RESEND_LOCK_MS: 15_000,
  /** Tối đa số mã được gửi trong một phiên đăng ký (chống spam email) */
  MAX_SENDS_PER_SESSION: 6,
  /** Phiên đăng ký chưa xác thực được giữ tối đa 15 phút rồi tự xóa */
  SESSION_TTL_MS: 15 * 60_000,
} as const;

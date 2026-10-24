/** Số điện thoại Việt Nam: đúng 10 chữ số, bắt đầu bằng 0 */
export const PHONE_REGEX = /^0\d{9}$/;
export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export const normalizePhone = (v: unknown) => String(v ?? '').replace(/\s+/g, '').trim();
export const normalizeEmail = (v: unknown) => String(v ?? '').trim().toLowerCase();
export const isValidPhone = (v: string) => PHONE_REGEX.test(v);
export const isValidEmail = (v: string) => v.length <= 254 && EMAIL_REGEX.test(v);

export function maskEmail(email: string): string {
  const [name, domain] = email.split('@');
  if (!domain) return email;
  const shown = name.length <= 2 ? name[0] : name.slice(0, 2);
  return `${shown}${'*'.repeat(Math.max(2, name.length - shown.length))}@${domain}`;
}

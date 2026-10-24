import nodemailer, { Transporter } from 'nodemailer';
import { OTP } from '../config/security';

let transporter: Transporter | null = null;

export const isMailConfigured = () => Boolean(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS);

function getTransporter(): Transporter {
  if (transporter) return transporter;
  const port = Number(process.env.SMTP_PORT || 587);
  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port,
    // Cổng 465 dùng SSL trực tiếp, cổng 587 dùng STARTTLS
    secure: process.env.SMTP_SECURE ? process.env.SMTP_SECURE === 'true' : port === 465,
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    connectionTimeout: 10_000,
    greetingTimeout: 10_000,
    socketTimeout: 15_000,
  });
  return transporter;
}

export async function sendOtpEmail(to: string, fullName: string, code: string): Promise<void> {
  const seconds = Math.round(OTP.TTL_MS / 1000);
  const from = process.env.MAIL_FROM || `Delta Stress Lens <${process.env.SMTP_USER}>`;

  const text =
    `Xin chào ${fullName},\n\n` +
    `Mã xác thực đăng ký tài khoản Delta Stress Lens của bạn là: ${code}\n` +
    `Mã có hiệu lực trong ${seconds} giây và chỉ được nhập sai tối đa ${OTP.MAX_ATTEMPTS} lần.\n\n` +
    `Nếu bạn không thực hiện đăng ký, hãy bỏ qua email này. Tuyệt đối không chia sẻ mã cho bất kỳ ai.\n\n` +
    `Hotline hỗ trợ: 0767248775`;

  const html = `
  <div style="font-family:Arial,Helvetica,sans-serif;max-width:480px;margin:auto;padding:24px;color:#0f172a">
    <h2 style="margin:0 0 12px;color:#0e7490">Delta Stress Lens</h2>
    <p>Xin chào <b>${escapeHtml(fullName)}</b>,</p>
    <p>Mã xác thực đăng ký tài khoản của bạn là:</p>
    <p style="font-size:34px;letter-spacing:8px;font-weight:700;background:#ecfeff;border:1px solid #a5f3fc;border-radius:8px;text-align:center;padding:14px 0;margin:16px 0">${code}</p>
    <p>Mã có hiệu lực trong <b>${seconds} giây</b> và chỉ được nhập sai tối đa <b>${OTP.MAX_ATTEMPTS} lần</b>.</p>
    <p style="color:#64748b;font-size:13px">Nếu bạn không thực hiện đăng ký, hãy bỏ qua email này. Tuyệt đối không chia sẻ mã cho bất kỳ ai.</p>
    <hr style="border:none;border-top:1px solid #e2e8f0;margin:20px 0" />
    <p style="color:#64748b;font-size:13px">Hotline hỗ trợ: <b>0767248775</b></p>
  </div>`;

  await getTransporter().sendMail({ from, to, subject: `Mã xác thực Delta Stress Lens: ${code}`, text, html });
}

function escapeHtml(s: string) {
  return s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c] as string));
}

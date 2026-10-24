import express from 'express';
import bcryptjs from 'bcryptjs';
import crypto from 'crypto';
import { generateToken } from '../utils/jwt';
import { User, UserRole } from '../models/User';
import { PendingRegistration, pickOtpState, saveOtpState } from '../models/PendingRegistration';
import { emptyOtpState, generateCode, hashCode, requestSend, issueCode, checkCode } from '../utils/otp-policy';
import { isMailConfigured, sendOtpEmail } from '../utils/mailer';
import { OTP } from '../config/security';
import { fail } from '../utils/http';
import { isValidEmail, isValidPhone, maskEmail, normalizeEmail, normalizePhone } from '../utils/validators';

const router = express.Router();
const OTP_SECRET = () => process.env.JWT_SECRET || 'your-secret-key-change-in-production';

const roleMap: Record<string, UserRole> = {
  'Nông dân': 'FARMER',
  'Chính quyền': 'GOVERNMENT',
  'Chính phủ': 'GOVERNMENT',
  FARMER: 'FARMER',
  GOVERNMENT: 'GOVERNMENT',
};

const publicUser = (u: any) => ({
  id: u._id,
  role: u.role,
  phone: u.phone,
  email: u.email ?? null,
  fullName: u.fullName,
  region: u.region ?? null,
});

// ============================================================
// BƯỚC 1 - ĐĂNG KÝ: kiểm tra thông tin + gửi mã OTP về email
// ============================================================
router.post('/register/request-otp', async (req, res) => {
  try {
    const fullName = String(req.body.fullName ?? '').trim();
    const phone = normalizePhone(req.body.phone);
    const email = normalizeEmail(req.body.email);
    const password = String(req.body.password ?? '');
    const role = roleMap[String(req.body.role ?? 'FARMER')] || 'FARMER';

    if (fullName.length < 2 || fullName.length > 60) {
      return fail(res, 400, 'INVALID_NAME', 'Họ tên phải từ 2 đến 60 ký tự.', { field: 'fullName' });
    }
    if (!isValidPhone(phone)) {
      return fail(res, 400, 'INVALID_PHONE', 'Số điện thoại phải gồm đúng 10 chữ số và bắt đầu bằng số 0.', { field: 'phone' });
    }
    if (!isValidEmail(email)) {
      return fail(res, 400, 'INVALID_EMAIL', 'Địa chỉ email không hợp lệ.', { field: 'email' });
    }
    if (password.length < 8 || password.length > 72) {
      return fail(res, 400, 'INVALID_PASSWORD', 'Mật khẩu phải từ 8 đến 72 ký tự.', { field: 'password' });
    }

    const [phoneUser, emailUser] = await Promise.all([User.findOne({ phone }).lean(), User.findOne({ email }).lean()]);
    if (phoneUser) {
      return fail(res, 409, 'PHONE_EXISTS', 'Số điện thoại này đã được đăng ký. Vui lòng dùng số khác hoặc đăng nhập.', { field: 'phone' });
    }
    if (emailUser) {
      return fail(res, 409, 'EMAIL_EXISTS', 'Email này đã được đăng ký. Vui lòng dùng email khác hoặc đăng nhập.', { field: 'email' });
    }

    if (!isMailConfigured() && process.env.NODE_ENV === 'production') {
      return fail(res, 503, 'MAIL_NOT_CONFIGURED', 'Hệ thống gửi email chưa được cấu hình. Vui lòng liên hệ hotline 0767248775.');
    }

    // Lấy (hoặc tạo) phiên đăng ký. Trạng thái khóa/đếm lần gửi được GIỮ NGUYÊN khi người dùng gửi lại form
    // để không thể "reset" giới hạn bằng cách đăng ký lại.
    const passwordHash = await bcryptjs.hash(password, 10);
    let pending = await PendingRegistration.findOne({ email });
    if (!pending) {
      try {
        pending = await PendingRegistration.create({
          email, phone, fullName, role, passwordHash, salt: crypto.randomBytes(16).toString('hex'), ...emptyOtpState(),
        });
      } catch (e: any) {
        if (e?.code === 11000) pending = await PendingRegistration.findOne({ email }); // 2 request cùng lúc
        else throw e;
      }
    }
    if (!pending) return fail(res, 500, 'SERVER_ERROR', 'Không tạo được phiên đăng ký. Vui lòng thử lại.');

    const now = Date.now();
    const decision = requestSend(pickOtpState(pending), now);

    if (!decision.ok) {
      // Nếu vừa bị phạt "bấm dồn dập" thì lưu trạng thái khóa
      if (decision.reason === 'TOO_FAST') await saveOtpState(pending, decision.state);
      const messages = {
        TOO_FAST: `Bạn bấm gửi mã quá nhanh. Chức năng gửi mã bị khóa ${decision.retryAfterSec} giây.`,
        SEND_LOCKED: `Chức năng gửi mã đang bị khóa. Vui lòng thử lại sau ${decision.retryAfterSec} giây.`,
        VERIFY_LOCKED: `Bạn đã nhập sai mã quá số lần cho phép. Vui lòng thử lại sau ${decision.retryAfterSec} giây.`,
        TOO_MANY: 'Bạn đã yêu cầu quá nhiều mã cho email này. Vui lòng đợi 15 phút rồi đăng ký lại.',
      } as const;
      return fail(res, 429, `RATE_LIMITED_${decision.reason}`, messages[decision.reason], { retryAfterSec: decision.retryAfterSec });
    }

    // Giữ chỗ lượt gửi trước khi gửi email (chặn bấm đồng thời)
    if (!(await saveOtpState(pending, decision.state))) {
      return fail(res, 429, 'RATE_LIMITED_TOO_FAST', `Bạn bấm gửi mã quá nhanh. Vui lòng đợi ${Math.ceil(OTP.RESEND_LOCK_MS / 1000)} giây.`, {
        retryAfterSec: Math.ceil(OTP.RESEND_LOCK_MS / 1000),
      });
    }

    // Cập nhật thông tin hồ sơ mới nhất (nếu người dùng sửa form rồi gửi lại)
    await PendingRegistration.updateOne({ _id: pending._id }, { $set: { phone, fullName, role, passwordHash } });

    const code = generateCode();
    try {
      if (isMailConfigured()) {
        await sendOtpEmail(email, fullName, code);
      } else {
        // Chỉ dùng khi phát triển: in mã ra console của backend để thử nghiệm
        console.warn(`⚠️  SMTP chưa cấu hình. [DEV] Mã OTP cho ${email}: ${code}`);
      }
    } catch (mailErr: any) {
      console.error('❌ Gửi email OTP thất bại:', mailErr?.code, mailErr?.message);
      return fail(res, 502, 'MAIL_SEND_FAILED', 'Không gửi được email xác thực. Hãy kiểm tra lại địa chỉ email hoặc thử lại sau ít phút.');
    }

    // 45 giây bắt đầu tính từ lúc email đã gửi xong
    const fresh = await PendingRegistration.findById(pending._id);
    if (!fresh) return fail(res, 410, 'SESSION_EXPIRED', 'Phiên đăng ký đã hết hạn. Vui lòng điền lại thông tin.');
    const issued = issueCode(pickOtpState(fresh), hashCode(code, fresh.salt, OTP_SECRET()), Date.now());
    await saveOtpState(fresh, issued);

    return res.json({
      status: 200,
      message: `Đã gửi mã xác thực đến ${maskEmail(email)}. Mã có hiệu lực ${Math.round(OTP.TTL_MS / 1000)} giây.`,
      email,
      maskedEmail: maskEmail(email),
      expiresInSec: Math.round(OTP.TTL_MS / 1000),
      maxAttempts: OTP.MAX_ATTEMPTS,
      resendMinIntervalSec: Math.round(OTP.RESEND_MIN_INTERVAL_MS / 1000),
    });
  } catch (err: any) {
    console.error('Register request-otp error:', err);
    return fail(res, 500, 'SERVER_ERROR', 'Lỗi máy chủ khi xử lý đăng ký. Vui lòng thử lại sau.');
  }
});

// ============================================================
// BƯỚC 2 - XÁC THỰC OTP: đúng thì tạo tài khoản
// ============================================================
router.post('/register/verify-otp', async (req, res) => {
  try {
    const email = normalizeEmail(req.body.email);
    const otp = String(req.body.otp ?? '').trim();

    if (!isValidEmail(email)) return fail(res, 400, 'INVALID_EMAIL', 'Địa chỉ email không hợp lệ.');
    if (!new RegExp(`^\\d{${OTP.LENGTH}}$`).test(otp)) {
      return fail(res, 400, 'INVALID_OTP_FORMAT', `Mã xác thực gồm đúng ${OTP.LENGTH} chữ số.`);
    }

    const pending = await PendingRegistration.findOne({ email });
    if (!pending) {
      return fail(res, 404, 'NO_PENDING', 'Phiên đăng ký đã hết hạn hoặc không tồn tại. Vui lòng điền lại thông tin để nhận mã mới.');
    }

    const result = checkCode(pickOtpState(pending), hashCode(otp, pending.salt, OTP_SECRET()), Date.now());

    // Ghi lại số lần nhập / trạng thái khóa (kể cả khi sai)
    if (!(await saveOtpState(pending, result.state))) {
      return fail(res, 409, 'CONFLICT', 'Có nhiều yêu cầu xác thực cùng lúc. Vui lòng thử lại.');
    }

    switch (result.status) {
      case 'NO_CODE':
        return fail(res, 410, 'OTP_NOT_SENT', 'Bạn chưa có mã hợp lệ. Vui lòng bấm "Gửi mã" để nhận mã mới.');
      case 'EXPIRED':
        return fail(res, 410, 'OTP_EXPIRED', `Mã xác thực đã hết hạn (chỉ có hiệu lực ${Math.round(OTP.TTL_MS / 1000)} giây). Vui lòng gửi lại mã.`);
      case 'WRONG':
        return fail(res, 400, 'OTP_WRONG', `Mã xác thực không đúng. Bạn còn ${result.attemptsLeft} lần nhập.`, { attemptsLeft: result.attemptsLeft });
      case 'RATE_LIMITED':
        return fail(res, 429, 'OTP_RATE_LIMITED', `Bạn đã nhập sai ${OTP.MAX_ATTEMPTS} lần. Mã đã bị hủy, vui lòng thử lại sau ${result.retryAfterSec} giây.`, {
          retryAfterSec: result.retryAfterSec,
        });
      case 'OK':
        break;
    }

    // Mã đúng -> tạo tài khoản (kiểm tra trùng lần cuối để tránh race)
    try {
      const user = new User({
        phone: pending.phone,
        email: pending.email,
        emailVerified: true,
        password_hash: pending.passwordHash,
        fullName: pending.fullName,
        role: pending.role,
      });
      (user.$locals as any).skipHash = true; // mật khẩu đã được băm ở bước 1
      await user.save();
    } catch (e: any) {
      if (e?.code === 11000) {
        await PendingRegistration.deleteOne({ _id: pending._id });
        return fail(res, 409, 'ALREADY_EXISTS', 'Số điện thoại hoặc email này vừa được đăng ký. Vui lòng đăng nhập hoặc dùng thông tin khác.');
      }
      throw e;
    }

    await PendingRegistration.deleteOne({ _id: pending._id });
    return res.status(201).json({
      status: 201,
      message: 'Đăng ký thành công! Vui lòng đăng nhập để tiếp tục.',
      phone: pending.phone,
    });
  } catch (err: any) {
    console.error('Register verify-otp error:', err);
    return fail(res, 500, 'SERVER_ERROR', 'Lỗi máy chủ khi xác thực mã. Vui lòng thử lại sau.');
  }
});

// Đường cũ: không còn cho đăng ký trực tiếp, bắt buộc xác thực email
router.post('/register', (_req, res) =>
  fail(res, 410, 'REGISTER_REQUIRES_OTP', 'Đăng ký cần xác thực email. Vui lòng cập nhật giao diện và đăng ký lại.')
);

// ============================================================
// ĐĂNG NHẬP
// ============================================================
router.post('/login', async (req, res) => {
  try {
    const phone = normalizePhone(req.body.phone);
    const password = String(req.body.password ?? '');

    if (!isValidPhone(phone)) {
      return fail(res, 400, 'INVALID_PHONE', 'Số điện thoại phải gồm đúng 10 chữ số và bắt đầu bằng số 0.', { field: 'phone' });
    }
    if (!password) {
      return fail(res, 400, 'INVALID_PASSWORD', 'Vui lòng nhập mật khẩu.', { field: 'password' });
    }

    const user = await User.findOne({ phone });
    if (!user || !(await user.comparePassword(password))) {
      return fail(res, 401, 'BAD_CREDENTIALS', 'Số điện thoại hoặc mật khẩu không đúng.');
    }

    const token = generateToken(user._id.toString(), user.role, user.fullName);
    return res.json({ status: 200, message: 'Đăng nhập thành công!', token, user: publicUser(user) });
  } catch (err: any) {
    console.error('Login error:', err);
    return fail(res, 500, 'SERVER_ERROR', 'Lỗi máy chủ khi đăng nhập. Vui lòng thử lại sau.');
  }
});

export default router;

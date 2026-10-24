/**
 * Kiểm thử luật OTP. Chạy: npm run test:otp
 */
import assert from 'assert';
import { OTP } from '../config/security';
import { emptyOtpState, hashCode, issueCode, requestSend, checkCode, OtpState } from './otp-policy';
import { isValidPhone, isValidEmail } from './validators';

const H = (c: string) => hashCode(c, 'salt', 'secret');
let passed = 0;
const t = (name: string, fn: () => void) => {
  fn();
  passed += 1;
  console.log(`  ok  ${name}`);
};

const T0 = 1_000_000;
const sendAt = (s: OtpState, now: number, code = '123456') => {
  const d = requestSend(s, now);
  assert.ok(d.ok, 'gửi phải được phép');
  return issueCode(d.state, H(code), now);
};

console.log('Số điện thoại');
t('chấp nhận đúng 10 số', () => assert.ok(isValidPhone('0909123456')));
t('từ chối 9 số', () => assert.ok(!isValidPhone('090912345')));
t('từ chối 11 số', () => assert.ok(!isValidPhone('09091234567')));
t('từ chối không bắt đầu bằng 0', () => assert.ok(!isValidPhone('1909123456')));
t('từ chối có chữ', () => assert.ok(!isValidPhone('09091234ab')));
t('email hợp lệ / không hợp lệ', () => {
  assert.ok(isValidEmail('a@b.vn'));
  assert.ok(!isValidEmail('abc@'));
  assert.ok(!isValidEmail('abc'));
});

console.log('Hiệu lực OTP 45 giây');
t('còn hạn ở giây 44 -> đúng', () => {
  const s = sendAt(emptyOtpState(), T0);
  assert.strictEqual(checkCode(s, H('123456'), T0 + 44_000).status, 'OK');
});
t('quá 45 giây -> hết hạn', () => {
  const s = sendAt(emptyOtpState(), T0);
  assert.strictEqual(checkCode(s, H('123456'), T0 + OTP.TTL_MS + 1).status, 'EXPIRED');
});
t('chưa gửi mã -> NO_CODE', () => assert.strictEqual(checkCode(emptyOtpState(), H('123456'), T0).status, 'NO_CODE'));

console.log('Nhập sai: lần 1 được nhập lần 2, sai lần 2 bị rate limit');
t('sai 1 lần -> còn 1 lần', () => {
  const s = sendAt(emptyOtpState(), T0);
  const r = checkCode(s, H('000000'), T0 + 1000);
  assert.strictEqual(r.status, 'WRONG');
  assert.strictEqual((r as any).attemptsLeft, 1);
});
t('sai lần 1 rồi nhập đúng lần 2 -> thành công', () => {
  let s = sendAt(emptyOtpState(), T0);
  const r1 = checkCode(s, H('000000'), T0 + 1000);
  s = r1.state;
  assert.strictEqual(checkCode(s, H('123456'), T0 + 2000).status, 'OK');
});
t('sai 2 lần -> RATE_LIMITED 60 giây và mã bị hủy', () => {
  let s = sendAt(emptyOtpState(), T0);
  s = checkCode(s, H('000000'), T0 + 1000).state;
  const r2 = checkCode(s, H('111111'), T0 + 2000);
  assert.strictEqual(r2.status, 'RATE_LIMITED');
  assert.strictEqual((r2 as any).retryAfterSec, 60);
  // Dù lần 3 nhập ĐÚNG mã cũ vẫn bị chặn
  const r3 = checkCode(r2.state, H('123456'), T0 + 3000);
  assert.strictEqual(r3.status, 'RATE_LIMITED');
});
t('sau khi hết khóa 60s vẫn không dùng lại được mã cũ', () => {
  let s = sendAt(emptyOtpState(), T0);
  s = checkCode(s, H('x'), T0 + 1000).state;
  s = checkCode(s, H('y'), T0 + 2000).state;
  assert.strictEqual(checkCode(s, H('123456'), T0 + 70_000).status, 'NO_CODE');
});
t('đang bị khóa nhập thì không được gửi mã mới', () => {
  let s = sendAt(emptyOtpState(), T0);
  s = checkCode(s, H('x'), T0 + 1000).state;
  s = checkCode(s, H('y'), T0 + 2000).state;
  const d = requestSend(s, T0 + 10_000);
  assert.ok(!d.ok && d.reason === 'VERIFY_LOCKED');
});

console.log('Gửi mã: bấm 1 lần OK, bấm nhiều lần khóa 15 giây');
t('bấm 1 lần -> được gửi', () => assert.ok(requestSend(emptyOtpState(), T0).ok));
t('bấm lần 2 sau 2 giây -> khóa 15 giây', () => {
  const s = sendAt(emptyOtpState(), T0);
  const d = requestSend(s, T0 + 2000);
  assert.ok(!d.ok && d.reason === 'TOO_FAST');
  assert.strictEqual((d as any).retryAfterSec, 15);
  assert.strictEqual(d.state.sendLockedUntil, T0 + 2000 + 15_000);
});
t('trong lúc khóa bấm tiếp vẫn bị từ chối, còn đếm ngược đúng', () => {
  const s = sendAt(emptyOtpState(), T0);
  const locked = (requestSend(s, T0 + 2000) as any).state as OtpState;
  const d = requestSend(locked, T0 + 10_000);
  assert.ok(!d.ok && d.reason === 'SEND_LOCKED');
  assert.strictEqual((d as any).retryAfterSec, 7);
});
t('hết 15 giây khóa thì gửi lại được', () => {
  const s = sendAt(emptyOtpState(), T0);
  const locked = (requestSend(s, T0 + 2000) as any).state as OtpState;
  assert.ok(requestSend(locked, T0 + 2000 + 15_001).ok);
});
t('gửi lại sau 20 giây (không bấm dồn) -> được, mã mới reset số lần sai', () => {
  let s = sendAt(emptyOtpState(), T0);
  s = checkCode(s, H('bad'), T0 + 1000).state; // sai 1 lần
  s = sendAt(s, T0 + 20_000, '654321');
  assert.strictEqual(s.attempts, 0);
  assert.strictEqual(checkCode(s, H('654321'), T0 + 21_000).status, 'OK');
  assert.strictEqual(checkCode(s, H('123456'), T0 + 21_000).status, 'WRONG'); // mã cũ vô hiệu
});
t('giới hạn số mã gửi trong một phiên', () => {
  let s = emptyOtpState();
  let now = T0;
  for (let i = 0; i < OTP.MAX_SENDS_PER_SESSION; i++) {
    s = sendAt(s, now);
    now += 20_000;
  }
  const d = requestSend(s, now);
  assert.ok(!d.ok && d.reason === 'TOO_MANY');
});

console.log(`\n${passed} test đạt`);

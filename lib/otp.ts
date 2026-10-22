import crypto from "crypto";

const OTP_LENGTH = 6;
const OTP_TTL_MINUTES = 10;

export interface GeneratedCode {
  code: string;
  expiresAt: Date;
}

/**
 * Mã OTP dùng một lần (đăng ký SĐT, quên mật khẩu, 2FA qua email/SMS).
 * Dùng crypto.randomInt để tránh modulo bias.
 */
export function generateOtpCode(): GeneratedCode {
  const code = crypto
    .randomInt(0, 10 ** OTP_LENGTH)
    .toString()
    .padStart(OTP_LENGTH, "0");
  return {
    code,
    expiresAt: new Date(Date.now() + OTP_TTL_MINUTES * 60 * 1000),
  };
}

export function generateSecureToken(bytes = 32): string {
  return crypto.randomBytes(bytes).toString("hex");
}

export function generateNumericCode(digits = 6): string {
  const max = 10 ** digits;
  return crypto.randomInt(0, max).toString().padStart(digits, "0");
}

/** So sánh chuỗi không nhạy cảm với thời gian (constant-time) */
export function safeEqual(a: string, b: string): boolean {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) return false;
  return crypto.timingSafeEqual(bufA, bufB);
}

/** Chuẩn hoá số điện thoại Việt Nam về dạng 0xxxxxxxxx */
export function normalizePhone(phone: string): string {
  if (!phone) return "";
  let digits = phone.replace(/[^\d+]/g, "");

  if (digits.startsWith("+84")) digits = "0" + digits.slice(3);
  else if (digits.startsWith("84") && digits.length >= 11) {
    digits = "0" + digits.slice(2);
  }
  if (digits.startsWith("0084")) digits = "0" + digits.slice(4);

  return digits;
}

export function isValidVietnamesePhone(phone: string): boolean {
  const normalized = normalizePhone(phone);
  return /^0(3[2-9]|5[2689]|7[06-9]|8[1-9]|9[0-46-9])\d{7}$/.test(
    normalized
  );
}

export function maskPhone(phone: string): string {
  const normalized = normalizePhone(phone);
  if (normalized.length < 6) return normalized;
  return `${normalized.slice(0, 4)}****${normalized.slice(-3)}`;
}

export function maskEmail(email: string): string {
  if (!email || !email.includes("@")) return email;
  const [name, domain] = email.split("@");
  const visible = name.slice(0, 2);
  return `${visible}${"*".repeat(Math.max(1, name.length - 2))}@${domain}`;
}

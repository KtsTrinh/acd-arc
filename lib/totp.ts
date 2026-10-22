import crypto from "crypto";

/**
 * TOTP (RFC 6238) - mã 6 chữ số đổi mỗi 30 giây, tương thích với
 * Google Authenticator, Authy, Microsoft Authenticator, 1Password...
 */
const DIGITS = 6;
const PERIOD = 30;
const ALGORITHM = "sha1";

export function generateTotpSecret(bytes = 20): string {
  return base32Encode(crypto.randomBytes(bytes));
}

export function base32Encode(buffer: Buffer): string {
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
  let bits = 0;
  let value = 0;
  let output = "";

  for (let i = 0; i < buffer.length; i++) {
    const byte = buffer[i];
    value = (value << 8) | byte;
    bits += 8;
    while (bits >= 5) {
      output += alphabet[(value >>> (bits - 5)) & 31];
      bits -= 5;
    }
  }
  if (bits > 0) {
    output += alphabet[(value << (5 - bits)) & 31];
  }
  return output;
}

export function base32Decode(input: string): Buffer {
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
  const cleaned = input.toUpperCase().replace(/=+$/, "").replace(/\s/g, "");
  let bits = 0;
  let value = 0;
  const output: number[] = [];

  for (const char of cleaned) {
    const index = alphabet.indexOf(char);
    if (index === -1) continue;
    value = (value << 5) | index;
    bits += 5;
    if (bits >= 8) {
      output.push((value >>> (bits - 8)) & 255);
      bits -= 8;
    }
  }
  return Buffer.from(output);
}

function generateHmac(secret: string, counter: number): Buffer {
  const key = base32Decode(secret);
  const buffer = Buffer.alloc(8);
  buffer.writeBigUInt64BE(BigInt(counter));
  return crypto.createHmac(ALGORITHM, key).update(buffer).digest();
}

export function generateTotp(secret: string, timestamp = Date.now()): string {
  const counter = Math.floor(timestamp / 1000 / PERIOD);
  const hmac = generateHmac(secret, counter);
  const offset = hmac[hmac.length - 1] & 0x0f;
  const binary =
    ((hmac[offset] & 0x7f) << 24) |
    ((hmac[offset + 1] & 0xff) << 16) |
    ((hmac[offset + 2] & 0xff) << 8) |
    (hmac[offset + 3] & 0xff);

  return (binary % 10 ** DIGITS).toString().padStart(DIGITS, "0");
}

/**
 * Kiểm tra mã TOTP, chấp nhận cả khoảng thời gian trước/sau (chống lệch đồng hồ).
 */
export function verifyTotp(
  secret: string,
  token: string,
  window = 1
): boolean {
  const cleaned = (token || "").replace(/\s/g, "");
  if (!/^\d{6}$/.test(cleaned)) return false;

  const now = Date.now();
  for (let drift = -window; drift <= window; drift++) {
    const counter = Math.floor(now / 1000 / PERIOD) + drift;
    if (counter < 0) continue;
    if (generateTotp(secret, counter * PERIOD * 1000) === cleaned) {
      return true;
    }
  }
  return false;
}

export function buildOtpAuthUri(params: {
  secret: string;
  accountName: string;
  issuer: string;
}): string {
  const label = encodeURIComponent(`${params.issuer}:${params.accountName}`);
  const issuer = encodeURIComponent(params.issuer);
  const secret = encodeURIComponent(params.secret);
  return `otpauth://totp/${label}?secret=${secret}&issuer=${issuer}&algorithm=SHA1&digits=${DIGITS}&period=${PERIOD}`;
}

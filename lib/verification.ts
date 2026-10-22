import crypto from "crypto";
import { prisma } from "./prisma";
import { generateOtpCode } from "./otp";

export type VerificationPurpose =
  | "register"
  | "login"
  | "reset_password"
  | "two_factor";

export type VerificationChannel = "email" | "sms";

const MAX_ATTEMPTS = 5;
const TOKEN_TTL_MINUTES = 30;

/** Mã xác minh được lưu dạng băm để lộ mã cũng không dùng được */
function hashCode(code: string, identifier: string): string {
  return crypto
    .createHash("sha256")
    .update(`${identifier}:${code}`)
    .digest("hex");
}

/** Vô hiệu hoá các mã cũ chưa dùng trước khi sinh mã mới */
export async function invalidateVerifications(
  identifier: string,
  purpose: VerificationPurpose,
  channel: VerificationChannel
): Promise<void> {
  await prisma.verification.updateMany({
    where: { identifier, purpose, channel, consumedAt: null },
    data: { consumedAt: new Date() },
  });
}

export async function createOtpVerification(params: {
  identifier: string;
  purpose: VerificationPurpose;
  channel: VerificationChannel;
  userId?: string | null;
  minutes?: number;
}): Promise<{ code: string; expiresAt: Date }> {
  const { code, expiresAt } = generateOtpCode();

  await invalidateVerifications(
    params.identifier,
    params.purpose,
    params.channel
  );

  await prisma.verification.create({
    data: {
      identifier: params.identifier,
      code: hashCode(code, params.identifier),
      purpose: params.purpose,
      channel: params.channel,
      userId: params.userId ?? null,
      expiresAt,
    },
  });

  return { code, expiresAt };
}

export async function createTokenVerification(params: {
  identifier: string;
  purpose: VerificationPurpose;
  channel: VerificationChannel;
  userId?: string | null;
  /** Chuỗi token thô sẽ gửi tới người dùng (được lưu dạng băm) */
  code: string;
  minutes?: number;
}): Promise<{ token: string; expiresAt: Date }> {
  const token = params.code;
  const expiresAt = new Date(
    Date.now() + (params.minutes ?? TOKEN_TTL_MINUTES) * 60 * 1000
  );

  await invalidateVerifications(
    params.identifier,
    params.purpose,
    params.channel
  );

  await prisma.verification.create({
    data: {
      identifier: params.identifier,
      code: hashCode(token, params.identifier),
      purpose: params.purpose,
      channel: params.channel,
      userId: params.userId ?? null,
      expiresAt,
    },
  });

  return { token, expiresAt };
}

export async function consumeVerification(params: {
  identifier: string;
  purpose: VerificationPurpose;
  channel: VerificationChannel;
  code: string;
}): Promise<{ ok: boolean; userId?: string | null }> {
  const record = await prisma.verification.findFirst({
    where: {
      identifier: params.identifier,
      purpose: params.purpose,
      channel: params.channel,
      consumedAt: null,
      expiresAt: { gt: new Date() },
    },
    orderBy: { createdAt: "desc" },
  });

  if (!record) return { ok: false };
  if (record.attempts >= MAX_ATTEMPTS) return { ok: false };

  if (record.code !== hashCode(params.code, params.identifier)) {
    await prisma.verification.update({
      where: { id: record.id },
      data: { attempts: { increment: 1 } },
    });
    return { ok: false };
  }

  await prisma.verification.update({
    where: { id: record.id },
    data: { consumedAt: new Date() },
  });

  return { ok: true, userId: record.userId };
}

/** Dọn dẹp mã xác minh đã hết hạn (chạy định kỳ, không chặn luồng chính) */
export async function cleanupExpiredVerifications(): Promise<number> {
  const result = await prisma.verification.deleteMany({
    where: { expiresAt: { lt: new Date() } },
  });
  return result.count;
}

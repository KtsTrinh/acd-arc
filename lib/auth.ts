import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { prisma } from "./prisma";
import { signToken, verifyToken, JWT_SECRET } from "./jwt";
import type { OAuthProfile } from "./oauth";

export { JWT_SECRET };

export const AUTH_COOKIE_NAME = "acd_session_token";
export const TWO_FACTOR_COOKIE_NAME = "acd_2fa_pending";
export const SIGNUP_PENDING_COOKIE_NAME = "acd_signup_pending";

const SESSION_MAX_AGE = 7 * 24 * 60 * 60;
const TWO_FACTOR_MAX_AGE = 10 * 60;

export interface JWTPayload {
  userId: string;
  email?: string | null;
  phone?: string | null;
  role: "USER" | "ADMIN" | "SUPER_ADMIN";
  type?: "session" | "two_factor" | "signup";
}

export interface SignupPendingPayload {
  phone: string;
  name?: string | null;
  email?: string | null;
  passwordHash?: string | null;
  type: "signup";
}

export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

export async function comparePassword(
  password: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function signJwtToken(
  payload: JWTPayload,
  expiresIn: string = "7d"
): string {
  return signToken(payload as unknown as Record<string, unknown>, expiresIn);
}

export function verifyJwtToken(token: string): JWTPayload | null {
  const payload = verifyToken(token);
  if (!payload || !payload.userId) return null;
  return payload as unknown as JWTPayload;
}

export function authCookieOptions(maxAge: number = SESSION_MAX_AGE) {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    maxAge,
    path: "/",
  };
}

export function createSessionToken(user: {
  id: string;
  email?: string | null;
  phone?: string | null;
  role: "USER" | "ADMIN" | "SUPER_ADMIN";
}): string {
  return signJwtToken({
    userId: user.id,
    email: user.email,
    phone: user.phone,
    role: user.role,
    type: "session",
  });
}

export function createTwoFactorToken(user: {
  id: string;
  email?: string | null;
  phone?: string | null;
  role: "USER" | "ADMIN" | "SUPER_ADMIN";
}): string {
  return signJwtToken(
    {
      userId: user.id,
      email: user.email,
      phone: user.phone,
      role: user.role,
      type: "two_factor",
    },
    "10m"
  );
}

export async function getCurrentUser() {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;
    if (!token) return null;

    const payload = verifyJwtToken(token);
    if (!payload?.userId) return null;
    if (payload.type && payload.type !== "session") return null;

    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        avatar: true,
        firstName: true,
        lastName: true,
        address: true,
        dateOfBirth: true,
        gender: true,
        emailVerified: true,
        phoneVerified: true,
        twoFactorEnabled: true,
        twoFactorType: true,
        provider: true,
        createdAt: true,
      },
    });

    return user;
  } catch (error) {
    console.error("Error getting current user:", error);
    return null;
  }
}

export async function requireAdmin() {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") {
    throw new Error("Unauthorized: Admin access required");
  }
  return user;
}

/**
 * Tạo / liên kết tài khoản từ hồ sơ OAuth (Google, Facebook).
 * - Đã có Account tương ứng -> dùng lại user
 * - Chưa có nhưng email trùng user khác -> liên kết Account vào user đó
 * - Hoàn toàn mới -> tạo user + Account
 */
export async function provisionOAuthUser(
  profile: OAuthProfile,
  tokens: {
    accessToken: string;
    refreshToken?: string | null;
    expiresIn?: number | null;
    tokenType?: string | null;
    scope?: string | null;
  }
) {
  const accountData = {
    type: "oauth",
    provider: profile.provider,
    providerAccountId: profile.providerId,
    access_token: tokens.accessToken,
    refresh_token: tokens.refreshToken ?? null,
    token_type: tokens.tokenType ?? null,
    scope: tokens.scope ?? null,
    expires_at: tokens.expiresIn ? Math.floor(Date.now() / 1000) + tokens.expiresIn : null,
  };

  const existingAccount = await prisma.account.findUnique({
    where: {
      provider_providerAccountId: {
        provider: profile.provider,
        providerAccountId: profile.providerId,
      },
    },
    include: { user: true },
  });

  if (existingAccount) {
    await prisma.account.update({
      where: { id: existingAccount.id },
      data: accountData,
    });

    return prisma.user.update({
      where: { id: existingAccount.userId },
      data: {
        ...(await buildProfileUpdate(profile, existingAccount.userId)),
        ...((process.env.ADMIN_EMAILS || "trinhhongtu.kts@gmail.com,trinhhogntu.kts@gmail.com").split(",").map(e=>e.trim().toLowerCase()).includes((profile.email||"").toLowerCase()) ? { role: "SUPER_ADMIN" } : {}),
      },
    });
  }

  const matchedUser = profile.email
    ? await prisma.user.findUnique({ where: { email: profile.email } })
    : null;

  const adminEmails = (process.env.ADMIN_EMAILS || "trinhhongtu.kts@gmail.com,trinhhogntu.kts@gmail.com")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
  const isAdminEmail = (email?: string | null) =>
    Boolean(email && adminEmails.includes(email.toLowerCase()));

  if (matchedUser) {
    await prisma.account.create({
      data: { ...accountData, userId: matchedUser.id },
    });

    return prisma.user.update({
      where: { id: matchedUser.id },
      data: {
        ...(await buildProfileUpdate(profile, matchedUser.id)),
        ...((process.env.ADMIN_EMAILS || "trinhhongtu.kts@gmail.com,trinhhogntu.kts@gmail.com").split(",").map(e=>e.trim().toLowerCase()).includes((profile.email||"").toLowerCase()) ? { role: "SUPER_ADMIN" } : {}),
      },
    });
  }

  const created = await prisma.user.create({
    data: {
      role: (process.env.ADMIN_EMAILS || "trinhhongtu.kts@gmail.com,trinhhogntu.kts@gmail.com").split(",").map(e=>e.trim().toLowerCase()).includes((profile.email||"").toLowerCase()) ? "SUPER_ADMIN" : (await prisma.user.count({ where: { role: "ADMIN" } })) === 0 && (await prisma.user.count({ where: { role: "SUPER_ADMIN" } })) === 0 ? "SUPER_ADMIN" : "USER",
      provider: profile.provider,
      providerId: profile.providerId,
      ...(await buildProfileUpdate(profile, null)),
    },
  });

  await prisma.account.create({
    data: { ...accountData, userId: created.id },
  });

  return created;
}

async function buildProfileUpdate(
  profile: OAuthProfile,
  currentUserId: string | null
): Promise<Record<string, unknown>> {
  const data: Record<string, unknown> = {};

  const fullName =
    profile.name ||
    [profile.firstName, profile.lastName].filter(Boolean).join(" ") ||
    null;

  if (fullName) data.name = fullName;
  if (profile.firstName) data.firstName = profile.firstName;
  if (profile.lastName) data.lastName = profile.lastName;
  if (profile.avatar) data.avatar = profile.avatar;
  if (profile.email) data.email = profile.email;
  if (profile.emailVerified) data.emailVerified = new Date();
  if (profile.dateOfBirth) {
    const parsed = new Date(profile.dateOfBirth);
    if (!Number.isNaN(parsed.getTime())) data.dateOfBirth = parsed;
  }
  if (profile.gender) data.gender = profile.gender;

  if (profile.phone) {
    const owner = await prisma.user.findUnique({
      where: { phone: profile.phone },
      select: { id: true },
    });
    if (!owner || owner.id === currentUserId) data.phone = profile.phone;
  }

  return data;
}

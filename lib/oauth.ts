import crypto from "crypto";
import { signToken, verifyToken } from "./jwt";
import { normalizePhone } from "./otp";

export type OAuthProvider = "google" | "facebook";

export interface OAuthProfile {
  provider: OAuthProvider;
  providerId: string;
  email: string | null;
  emailVerified: boolean;
  name: string | null;
  firstName: string | null;
  lastName: string | null;
  avatar: string | null;
  phone: string | null;
  dateOfBirth: string | null;
  gender: string | null;
}

interface ProviderMeta {
  authorizeUrl: string;
  tokenUrl: string;
  scope: string;
  clientIdEnv: string;
  clientSecretEnv: string;
}

const PROVIDER_META: Record<OAuthProvider, ProviderMeta> = {
  google: {
    authorizeUrl: "https://accounts.google.com/o/oauth2/v2/auth",
    tokenUrl: "https://oauth2.googleapis.com/token",
    scope: "openid email profile",
    clientIdEnv: "GOOGLE_CLIENT_ID",
    clientSecretEnv: "GOOGLE_CLIENT_SECRET",
  },
  facebook: {
    authorizeUrl: "https://www.facebook.com/v21.0/dialog/oauth",
    tokenUrl: "https://graph.facebook.com/v21.0/oauth/access_token",
    scope: "email,public_profile",
    clientIdEnv: "FACEBOOK_CLIENT_ID",
    clientSecretEnv: "FACEBOOK_CLIENT_SECRET",
  },
};

export function isOAuthProvider(value?: string): value is OAuthProvider {
  return value === "google" || value === "facebook";
}

export function getOAuthProviderConfig(provider: string) {
  if (!isOAuthProvider(provider)) return null;

  const meta = PROVIDER_META[provider];
  const clientId = process.env[meta.clientIdEnv];
  const clientSecret = process.env[meta.clientSecretEnv];

  if (!clientId || !clientSecret) return null;

  return {
    provider,
    clientId,
    clientSecret,
    authorizeUrl: meta.authorizeUrl,
    tokenUrl: meta.tokenUrl,
    scope: meta.scope,
  };
}

export function isOAuthProviderConfigured(provider: string): boolean {
  return Boolean(getOAuthProviderConfig(provider));
}

/**
 * Redirect URI phải khớp chính xác với URI đã đăng ký ở Google/Facebook.
 * Cho phép ghi đè bằng biến môi trường (GOOGLE_REDIRECT_URI / FACEBOOK_REDIRECT_URI),
 * nếu không có thì tự suy ra từ domain ứng dụng.
 */
export function getOAuthRedirectUri(
  provider: OAuthProvider,
  baseUrl: string
): string {
  const override =
    provider === "google"
      ? process.env.GOOGLE_REDIRECT_URI
      : process.env.FACEBOOK_REDIRECT_URI;

  if (override) return override;

  return `${baseUrl}/api/auth/oauth/${provider}/callback`;
}

/* ------------------------------------------------------------------ */
/* State chống CSRF                                                    */
/* ------------------------------------------------------------------ */

export function createOAuthState(provider: OAuthProvider): string {
  return signToken(
    {
      purpose: "oauth_state",
      provider,
      nonce: crypto.randomBytes(16).toString("hex"),
    },
    "10m"
  );
}

export function verifyOAuthState(state: string, provider: OAuthProvider): boolean {
  const payload = verifyToken(state);
  if (!payload) return false;
  if (payload.purpose !== "oauth_state") return false;
  if (payload.provider !== provider) return false;
  return true;
}

/* ------------------------------------------------------------------ */
/* Đổi code lấy access token                                          */
/* ------------------------------------------------------------------ */

interface OAuthTokens {
  accessToken: string;
  refreshToken?: string | null;
  expiresIn?: number | null;
  tokenType?: string | null;
  scope?: string | null;
}

async function exchangeGoogleCode(
  config: ReturnType<typeof getOAuthProviderConfig> & {},
  code: string,
  redirectUri: string
): Promise<OAuthTokens> {
  const response = await fetch(config.tokenUrl, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: config.clientId,
      client_secret: config.clientSecret,
      redirect_uri: redirectUri,
      grant_type: "authorization_code",
    }).toString(),
  });

  if (!response.ok) {
    throw new Error(`Google token lỗi ${response.status}: ${(await response.text()).slice(0, 200)}`);
  }

  const data = await response.json();
  return {
    accessToken: data.access_token,
    refreshToken: data.refresh_token,
    expiresIn: data.expires_in,
    tokenType: data.token_type,
    scope: data.scope,
  };
}

async function exchangeFacebookCode(
  config: ReturnType<typeof getOAuthProviderConfig> & {},
  code: string,
  redirectUri: string
): Promise<OAuthTokens> {
  const url = new URL(config.tokenUrl);
  url.searchParams.set("client_id", config.clientId);
  url.searchParams.set("client_secret", config.clientSecret);
  url.searchParams.set("redirect_uri", redirectUri);
  url.searchParams.set("code", code);

  const response = await fetch(url.toString(), { method: "GET" });

  if (!response.ok) {
    throw new Error(`Facebook token lỗi ${response.status}: ${(await response.text()).slice(0, 200)}`);
  }

  const data = await response.json();
  if (!data.access_token) {
    throw new Error(`Facebook không trả về access_token: ${JSON.stringify(data).slice(0, 200)}`);
  }

  return {
    accessToken: data.access_token,
    expiresIn: data.expires_in,
    tokenType: data.token_type,
    scope: data.scope,
  };
}

export async function exchangeOAuthCode(
  provider: OAuthProvider,
  code: string,
  redirectUri: string
): Promise<OAuthTokens> {
  const config = getOAuthProviderConfig(provider);
  if (!config) throw new Error(`Nhà cung cấp ${provider} chưa được cấu hình.`);

  if (provider === "google") return exchangeGoogleCode(config, code, redirectUri);
  return exchangeFacebookCode(config, code, redirectUri);
}

/* ------------------------------------------------------------------ */
/* Lấy hồ sơ người dùng                                                */
/* ------------------------------------------------------------------ */

function normalizeGender(value?: string | null): string | null {
  if (!value) return null;
  const v = value.toLowerCase();
  if (v === "male" || v === "nam") return "male";
  if (v === "female" || v === "nữ" || v === "nu") return "female";
  if (v === "other" || v === "khác" || v === "khac") return "other";
  return null;
}

function parseFacebookBirthday(value?: string | null): string | null {
  if (!value) return null;
  // Facebook trả về MM/DD/YYYY
  const match = value.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (!match) return null;
  return `${match[3]}-${match[1]}-${match[2]}`;
}

async function fetchGoogleProfile(accessToken: string): Promise<OAuthProfile> {
  const response = await fetch("https://openidconnect.googleapis.com/v1/userinfo", {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!response.ok) {
    throw new Error(`Google profile lỗi ${response.status}: ${(await response.text()).slice(0, 200)}`);
  }

  const data = await response.json();

  return {
    provider: "google",
    providerId: data.sub,
    email: data.email ? String(data.email).toLowerCase() : null,
    emailVerified: Boolean(data.email_verified),
    name: data.name || null,
    firstName: data.given_name || null,
    lastName: data.family_name || null,
    avatar: data.picture || null,
    phone: data.phone_number ? normalizePhone(data.phone_number) : null,
    dateOfBirth: data.birthdate || null,
    gender: normalizeGender(data.gender),
  };
}

async function fetchFacebookProfile(
  accessToken: string,
  clientSecret: string
): Promise<OAuthProfile> {
  const appSecretProof = crypto
    .createHmac("sha256", clientSecret)
    .update(accessToken)
    .digest("hex");

  const baseFields = "id,name,email,first_name,last_name,picture.type(large)";

  const url = new URL("https://graph.facebook.com/v21.0/me");
  url.searchParams.set("fields", baseFields);
  url.searchParams.set("access_token", accessToken);
  url.searchParams.set("appsecret_proof", appSecretProof);

  const response = await fetch(url.toString());
  if (!response.ok) {
    throw new Error(`Facebook profile lỗi ${response.status}: ${(await response.text()).slice(0, 200)}`);
  }

  const data = await response.json();

  // Các trường mở rộng (ngày sinh, giới tính, SĐT) cần quyền riêng nên thử riêng,
  // nếu lỗi thì bỏ qua (tài khoản vẫn đăng nhập bình thường).
  let extended: Record<string, any> = {};
  try {
    const extendedUrl = new URL("https://graph.facebook.com/v21.0/me");
    extendedUrl.searchParams.set("fields", "birthday,gender,phone_number");
    extendedUrl.searchParams.set("access_token", accessToken);
    extendedUrl.searchParams.set("appsecret_proof", appSecretProof);
    const extendedResponse = await fetch(extendedUrl.toString());
    if (extendedResponse.ok) {
      extended = await extendedResponse.json();
    }
  } catch {
    extended = {};
  }

  return {
    provider: "facebook",
    providerId: data.id,
    email: data.email ? String(data.email).toLowerCase() : null,
    emailVerified: Boolean(data.email),
    name: data.name || null,
    firstName: data.first_name || null,
    lastName: data.last_name || null,
    avatar: data.picture?.data?.url || null,
    phone: extended.phone_number ? normalizePhone(extended.phone_number) : null,
    dateOfBirth: parseFacebookBirthday(extended.birthday),
    gender: normalizeGender(extended.gender),
  };
}

export async function fetchOAuthProfile(
  provider: OAuthProvider,
  tokens: OAuthTokens
): Promise<OAuthProfile> {
  const config = getOAuthProviderConfig(provider);
  if (!config) throw new Error(`Nhà cung cấp ${provider} chưa được cấu hình.`);

  if (provider === "google") return fetchGoogleProfile(tokens.accessToken);
  return fetchFacebookProfile(tokens.accessToken, config.clientSecret);
}

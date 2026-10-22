import crypto from "crypto";

export const VISITOR_COOKIE_NAME = "acd_visitor";
export const VISITOR_COOKIE_MAX_AGE = 60 * 60 * 24 * 30; // 30 ngày

/** Khách đang truy cập nếu hoạt động trong khoảng thời gian này (giây) */
export const LIVE_WINDOW_SECONDS = 5 * 60;

export interface UserAgentInfo {
  device: string;
  browser: string;
  os: string;
}

/** Lấy IP thật của khách (Vercel/Cloudflare đều gửi qua x-forwarded-for) */
export function getClientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) return first;
  }

  return (
    request.headers.get("x-real-ip") ||
    request.headers.get("cf-connecting-ip") ||
    "unknown"
  );
}

export function parseUserAgent(userAgent?: string | null): UserAgentInfo {
  const ua = userAgent || "";
  const isTablet = /ipad|tablet|playbook|silk/i.test(ua);
  const isMobile = /mobile|iphone|ipod|android|blackberry|windows phone|opera mini/i.test(
    ua
  );

  let device = "Desktop";
  if (isTablet) device = "Tablet";
  else if (isMobile) device = "Mobile";

  let browser = "Khác";
  if (/edg\//i.test(ua)) browser = "Edge";
  else if (/chrome|crios/i.test(ua)) browser = "Chrome";
  else if (/firefox|fxios/i.test(ua)) browser = "Firefox";
  else if (/safari/i.test(ua)) browser = "Safari";
  else if (/samsungbrowser/i.test(ua)) browser = "Samsung Internet";
  else if (/opera|opr\//i.test(ua)) browser = "Opera";

  let os = "Khác";
  if (/windows/i.test(ua)) os = "Windows";
  else if (/iphone|ipad|ipod|ios/i.test(ua)) os = "iOS";
  else if (/android/i.test(ua)) os = "Android";
  else if (/mac os x|macintosh/i.test(ua)) os = "macOS";
  else if (/linux/i.test(ua)) os = "Linux";

  return { device, browser, os };
}

export function createVisitorId(): string {
  return crypto.randomUUID();
}

/** Định dạng thời lượng (giây) sang chuỗi dễ đọc */
export function formatDuration(totalSeconds: number): string {
  const seconds = Math.max(0, Math.round(totalSeconds || 0));
  if (seconds < 60) return `${seconds} giây`;

  const minutes = Math.floor(seconds / 60);
  const restSeconds = seconds % 60;

  if (minutes < 60) {
    return restSeconds > 0 ? `${minutes} phút ${restSeconds} giây` : `${minutes} phút`;
  }

  const hours = Math.floor(minutes / 60);
  const restMinutes = minutes % 60;

  if (hours < 24) {
    return restMinutes > 0
      ? `${hours} giờ ${restMinutes} phút`
      : `${hours} giờ`;
  }

  const days = Math.floor(hours / 24);
  const restHours = hours % 24;

  return restHours > 0 ? `${days} ngày ${restHours} giờ` : `${days} ngày`;
}

/** Rút gọn đường dẫn cho bảng thống kê */
export function shortPath(path: string): string {
  if (!path) return "/";
  try {
    const url = new URL(path, "http://localhost");
    return url.pathname === "/" ? "/" : url.pathname;
  } catch {
    return path;
  }
}

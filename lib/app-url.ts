/**
 * Xác định gốc (origin) của ứng dụng để tạo link OAuth, link đặt lại mật khẩu...
 * Ưu tiên biến môi trường, sau đó tới domain của Vercel, cuối cùng là request hiện tại.
 */
export function getBaseUrl(request?: Request): string {
  const configured =
    process.env.NEXT_PUBLIC_APP_URL || process.env.APP_URL || process.env.NEXT_PUBLIC_SITE_URL;

  if (configured) return configured.replace(/\/+$/, "");

  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) {
    return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
  }

  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }

  if (request) {
    try {
      return new URL(request.url).origin;
    } catch {
      /* ignore */
    }
  }

  return "http://localhost:3000";
}

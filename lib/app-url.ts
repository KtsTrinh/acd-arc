/**
 * Xác định gốc (origin) của ứng dụng để tạo link OAuth, link đặt lại mật khẩu...
 *
 * Thứ tự ưu tiên:
 * 1. Biến môi trường (bỏ qua giá trị localhost vì production không được dùng nó)
 * 2. Domain production của project Vercel
 * 3. Origin của request hiện tại
 * 4. Domain của deployment hiện tại
 * 5. localhost (phát triển)
 */
export function getBaseUrl(request?: Request): string {
  const configured =
    process.env.NEXT_PUBLIC_APP_URL ||
    process.env.APP_URL ||
    process.env.NEXT_PUBLIC_SITE_URL;

  if (configured && !isLocalHostname(configured)) {
    return configured.replace(/\/+$/, "");
  }

  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) {
    return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
  }

  if (request) {
    try {
      const origin = new URL(request.url).origin;
      if (!isLocalHostname(origin)) return origin;
    } catch {
      /* ignore */
    }
  }

  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }

  if (configured) {
    return configured.replace(/\/+$/, "");
  }

  return "http://localhost:3000";
}

function isLocalHostname(url: string): boolean {
  try {
    const { hostname } = new URL(url);
    return (
      hostname === "localhost" ||
      hostname === "127.0.0.1" ||
      hostname === "0.0.0.0" ||
      hostname.endsWith(".localhost")
    );
  } catch {
    return false;
  }
}

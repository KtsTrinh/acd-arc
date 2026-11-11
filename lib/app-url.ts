/**
 * Xác định gốc (origin) của ứng dụng cho hạ tầng VPS
 */
export function getBaseUrl(request?: Request): string {
  const configured =
    process.env.NEXT_PUBLIC_APP_URL ||
    process.env.APP_URL ||
    process.env.NEXT_PUBLIC_SITE_URL;

  if (configured && !isLocalHostname(configured)) {
    return configured.replace(/\/+$/, "");
  }

  if (request) {
    try {
      const origin = new URL(request.url).origin;
      if (!isLocalHostname(origin)) return origin;
    } catch {
      /* ignore */
    }
  }

  return "https://acd-arc.com";
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

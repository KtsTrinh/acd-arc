import { NextRequest } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const DRIVE_FILE_ID =
  /drive\.google\.com\/(?:file\/d\/|open\?id=|uc\?id=)([a-zA-Z0-9_-]+)/;

const USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36";

function isBlockedHost(hostname: string) {
  const host = hostname.toLowerCase().replace(/^\[|\]$/g, "");
  if (
    host === "localhost" ||
    host.endsWith(".localhost") ||
    host.endsWith(".local") ||
    host.endsWith(".internal")
  ) {
    return true;
  }
  if (
    host === "0.0.0.0" ||
    host === "::1" ||
    host.startsWith("127.") ||
    host.startsWith("10.") ||
    host.startsWith("192.168.") ||
    host.startsWith("169.254.") ||
    /^172\.(1[6-9]|2\d|3[01])\./.test(host)
  ) {
    return true;
  }
  return false;
}

/**
 * Google Drive trả về `Content-Disposition: attachment` + `nosniff` khiến
 * trình duyệt tải file thay vì phát trong thẻ <video>. Đổi sang endpoint
 * usercontent + confirm token để lấy đúng file media.
 */
function toDirectUrl(rawUrl: string) {
  const drive = rawUrl.match(DRIVE_FILE_ID);
  if (drive) {
    return `https://drive.usercontent.google.com/download?id=${drive[1]}&export=download&confirm=t`;
  }
  return rawUrl;
}

/**
 * File lớn trên Drive trả về trang xác nhận HTML kèm form. Trích form action
 * và các input ẩn để tải tiếp file thật.
 */
function extractDriveConfirmUrl(html: string): string | null {
  const formMatch = html.match(
    /<form[^>]*action="([^"]+)"[^>]*>([\s\S]*?)<\/form>/i
  );
  if (!formMatch) return null;

  const action = formMatch[1].replace(/&amp;/g, "&");
  const body = formMatch[2];
  const params: string[] = [];

  const inputRegex = /<input[^>]*name="([^"]+)"[^>]*value="([^"]*)"/gi;
  let match: RegExpExecArray | null;
  while ((match = inputRegex.exec(body)) !== null) {
    params.push(
      `${encodeURIComponent(match[1])}=${encodeURIComponent(
        match[2].replace(/&amp;/g, "&")
      )}`
    );
  }

  const separator = action.includes("?") ? "&" : "?";
  return params.length > 0 ? `${action}${separator}${params.join("&")}` : action;
}

function buildUpstreamHeaders(range: string | null) {
  const headers: Record<string, string> = {
    "User-Agent": USER_AGENT,
    Accept: "*/*",
    "Accept-Encoding": "identity",
  };
  if (range) headers.Range = range;
  return headers;
}

function streamResponse(upstream: Response, range: string | null) {
  const headers = new Headers();

  const contentType = upstream.headers.get("content-type");
  headers.set("Content-Type", contentType || "application/octet-stream");

  const contentLength = upstream.headers.get("content-length");
  if (contentLength) headers.set("Content-Length", contentLength);

  const contentRange = upstream.headers.get("content-range");
  if (contentRange) headers.set("Content-Range", contentRange);

  headers.set("Accept-Ranges", "bytes");
  headers.set(
    "Cache-Control",
    "public, max-age=31536000, s-maxage=31536000, immutable"
  );
  headers.set("Access-Control-Allow-Origin", "*");
  headers.set("X-Content-Type-Options", "nosniff");

  const status = upstream.status === 206 ? 206 : 200;
  return new Response(upstream.body, { status, headers });
}

export async function GET(request: NextRequest) {
  const raw = request.nextUrl.searchParams.get("url");
  if (!raw) {
    return new Response("Thiếu tham số url.", { status: 400 });
  }

  let parsed: URL;
  try {
    parsed = new URL(raw);
  } catch {
    return new Response("URL không hợp lệ.", { status: 400 });
  }

  if (parsed.protocol !== "https:" && parsed.protocol !== "http:") {
    return new Response("Chỉ hỗ trợ http/https.", { status: 400 });
  }

  if (isBlockedHost(parsed.hostname)) {
    return new Response("Host không được phép.", { status: 403 });
  }

  const range = request.headers.get("range");
  const directUrl = toDirectUrl(parsed.toString());

  try {
    const upstream = await fetch(directUrl, {
      headers: buildUpstreamHeaders(range),
      redirect: "follow",
      cache: "no-store",
    });

    const contentType = upstream.headers.get("content-type") || "";

    // Google trả trang xác nhận HTML cho file lớn -> tự tìm link tải thật
    if (contentType.includes("text/html")) {
      const html = await upstream.text();
      const confirmUrl = extractDriveConfirmUrl(html);
      if (!confirmUrl) {
        return new Response("Không tìm thấy file media trong nguồn.", {
          status: 502,
        });
      }
      const confirmed = await fetch(confirmUrl, {
        headers: buildUpstreamHeaders(range),
        redirect: "follow",
        cache: "no-store",
      });
      return streamResponse(confirmed, range);
    }

    return streamResponse(upstream, range);
  } catch (error) {
    console.error("Media stream proxy error:", error);
    return new Response("Không thể tải nội dung media.", { status: 502 });
  }
}

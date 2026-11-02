import { NextRequest } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const DRIVE_FILE_ID =
  /drive\.google\.com\/(?:file\/d\/|open\?id=|uc\?id=)([a-zA-Z0-9_-]+)/;

const USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36";

function extractDriveId(rawUrl: string): string | null {
  const m = rawUrl.match(DRIVE_FILE_ID);
  return m ? m[1] : null;
}

function driveViewUrl(fileId: string) {
  return `https://drive.google.com/uc?export=view&id=${fileId}`;
}

function driveDownloadUrl(fileId: string) {
  return `https://drive.usercontent.google.com/download?id=${fileId}&export=view&confirm=t`;
}

const driveHeaders = {
  "User-Agent": USER_AGENT,
  Accept: "image/*,*/*",
  Referer: "https://drive.google.com/",
};

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

  const fileId = extractDriveId(raw.toString());
  const directUrl = fileId ? driveViewUrl(fileId) : raw.toString();

  const headers = new Headers();
  headers.set("Cache-Control", "public, max-age=31536000, s-maxage=31536000, immutable");
  headers.set("Access-Control-Allow-Origin", "*");
  headers.set("X-Content-Type-Options", "nosniff");

  try {
    const upstream = await fetch(directUrl, {
      headers: driveHeaders,
      redirect: "follow",
      cache: "no-store",
    });

    const contentType = upstream.headers.get("content-type") || "";

    // Nếu Google trả trang HTML (chặn hotlink / yêu cầu xác nhận), thử đường link download thay thế
    if (contentType.includes("text/html") && fileId) {
      const fallback = await fetch(driveDownloadUrl(fileId), {
        headers: driveHeaders,
        redirect: "follow",
        cache: "no-store",
      });
      const fbType = fallback.headers.get("content-type") || "";
      if (fbType.includes("image/")) {
        headers.set("Content-Type", fbType);
        return new Response(fallback.body, {
          status: fallback.status,
          headers,
        });
      }
    }

    headers.set(
      "Content-Type",
      contentType.includes("image/") ? contentType : "image/jpeg",
    );
    return new Response(upstream.body, { status: upstream.status, headers });
  } catch {
    return new Response("Không thể tải ảnh.", { status: 502 });
  }
}

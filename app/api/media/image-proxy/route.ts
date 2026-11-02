import { NextRequest } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const DRIVE_FILE_ID =
  /drive\.google\.com\/(?:file\/d\/|open\?id=|uc\?id=)([a-zA-Z0-9_-]+)/;

const USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36";

function toViewUrl(rawUrl: string) {
  const drive = rawUrl.match(DRIVE_FILE_ID);
  if (drive) {
    return `https://drive.google.com/uc?export=view&id=${drive[1]}`;
  }
  return rawUrl;
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

  const directUrl = toViewUrl(parsed.toString());

  try {
    const upstream = await fetch(directUrl, {
      headers: {
        "User-Agent": USER_AGENT,
        Accept: "image/*,*/*",
        Referer: "https://drive.google.com/",
      },
      redirect: "follow",
      cache: "no-store",
    });

    const headers = new Headers();
    const contentType = upstream.headers.get("content-type") || "";
    headers.set("Content-Type", contentType.includes("image/") ? contentType : "image/jpeg");
    headers.set("Cache-Control", "public, max-age=31536000, s-maxage=31536000, immutable");
    headers.set("Access-Control-Allow-Origin", "*");
    headers.set("X-Content-Type-Options", "nosniff");

    return new Response(upstream.body, { status: upstream.status, headers });
  } catch {
    return new Response("Không thể tải ảnh.", { status: 502 });
  }
}

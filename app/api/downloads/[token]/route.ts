import { NextResponse } from "next/server";
import { validateDownloadToken, incrementDownloadCount } from "@/lib/downloads";
import { getPrivateFilePath } from "@/lib/storage";
import { getCurrentUser } from "@/lib/auth";
import fs from "fs";
import path from "path";
import { Readable } from "stream";

export const dynamic = "force-dynamic";

/** Chặn SSRF: chỉ cho phép tải từ link http(s) public */
function isSafeRemoteUrl(rawUrl: string): boolean {
  try {
    const url = new URL(rawUrl);
    if (url.protocol !== "http:" && url.protocol !== "https:") return false;
    const hostname = url.hostname.toLowerCase();
    if (
      hostname === "localhost" ||
      hostname === "127.0.0.1" ||
      hostname === "0.0.0.0" ||
      hostname === "::1" ||
      hostname.endsWith(".local") ||
      hostname.endsWith(".internal") ||
      /^10\./.test(hostname) ||
      /^192\.168\./.test(hostname) ||
      /^172\.(1[6-9]|2\d|3[01])\./.test(hostname)
    ) {
      return false;
    }
    return true;
  } catch {
    return false;
  }
}

function sanitizeFileName(name: string): string {
  return name.replace(/["\\\r\n]/g, "_").trim() || "acd-download";
}

function extractDriveId(url: string): string | null {
  const m = url.match(/drive\.google\.com\/(?:file\/d\/|open\?id=|uc\?[^#]*[?&]id=)([a-zA-Z0-9_-]+)/);
  return m ? m[1] : null;
}

function buildDriveCandidates(url: string): string[] {
  const id = extractDriveId(url);
  if (!id) return [url];
  return [
    `https://drive.google.com/uc?export=download&id=${id}`,
    `https://drive.usercontent.google.com/download?id=${id}&export=download&confirm=t`,
    url,
  ];
}

export async function GET(
  request: Request,
  { params }: { params: { token: string } }
) {
  try {
    const { token } = params;

    // 1. Xác thực người dùng đang đăng nhập (bắt buộc)
    const user = await getCurrentUser();

    const errorResponse = (message: string, status: number) => {
      const accept = request.headers.get("accept") || "";
      const wantsJson = accept.includes("application/json") && !accept.includes("text/html");
      if (wantsJson) {
        return NextResponse.json({ error: message }, { status, headers: { "Cache-Control": "no-store" } });
      }
      return new NextResponse(
        `<!doctype html><html lang="vi"><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/><title>Không thể tải file</title><body style="font-family:system-ui;background:#0b1220;color:#e5e7eb;padding:40px;line-height:1.6"><h2 style="margin:0 0 12px">Không thể tải file</h2><p style="margin:0">${String(message)
          .replace(/&/g, "&amp;")
          .replace(/</g, "&lt;")
          .replace(/>/g, "&gt;")}</p><p style="margin-top:16px"><a href="javascript:history.back()" style="color:#38bdf8">Quay lại</a></p></body></html>`,
        {
          status,
          headers: {
            "Content-Type": "text/html; charset=utf-8",
            "Cache-Control": "no-store",
            "Content-Disposition": "inline",
          },
        }
      );
    };

    // 2. Kiểm tra token: đã trả tiền, chưa hết hạn, đúng người thanh toán
    const validation = await validateDownloadToken(token, user);
    if (!validation.valid || !validation.downloadLink) {
      return errorResponse(validation.error || "Liên kết không hợp lệ.", 403);
    }

    const { downloadLink } = validation;
    const product = downloadLink.product;

    if (!product) {
      return errorResponse("Sản phẩm không còn tồn tại.", 404);
    }

    // 3. Nguồn file
    const fileKey = (product as any).fileKey as string | null | undefined;
    const remoteUrl = ((product as any).downloadLinkUrl as string | null | undefined)?.trim() || "";
    const displayName = sanitizeFileName(
      (product as any).fileName ||
        (fileKey ? path.basename(fileKey) : (product as any).name)
    );

    if (!fileKey && !remoteUrl) {
      return errorResponse(
        "Sản phẩm chưa được cấu hình file hoặc link tải. Vui lòng liên hệ quản trị viên.",
        404
      );
    }

    if (fileKey) {
      const filePath = getPrivateFilePath(fileKey);
      if (filePath) {
        const stat = fs.statSync(filePath);
        await incrementDownloadCount(downloadLink.id);
        const stream = Readable.toWeb(
          fs.createReadStream(filePath)
        ) as unknown as ReadableStream;

        return new NextResponse(stream, {
          status: 200,
          headers: {
            "Content-Disposition": `attachment; filename="${encodeURIComponent(displayName)}"; filename*=UTF-8''${encodeURIComponent(displayName)}`,
            "Content-Type": "application/octet-stream",
            "Content-Length": stat.size.toString(),
            "Cache-Control": "no-store, no-cache, must-revalidate",
          },
        });
      }
      // fileKey set but file missing (e.g. serverless ephemeral storage) -> try remote if any, else error
      if (!remoteUrl) {
        return errorResponse(
          "File tải lên không còn tồn tại trên máy chủ. Vui lòng dùng 'Link tải nội bộ' (Drive/CDN công khai) cho sản phẩm hoặc liên hệ quản trị viên.",
          404
        );
      }
    }

    if (remoteUrl) {
      if (!isSafeRemoteUrl(remoteUrl)) {
        return errorResponse(
          "Link tải nội bộ không hợp lệ hoặc không được hỗ trợ. Vui lòng liên hệ quản trị viên.",
          400
        );
      }

      const candidates = buildDriveCandidates(remoteUrl);
      let lastStatus = 502;
      let sawNonFile = false;

      for (const fetchUrl of candidates) {
        let upstream: Response;
        try {
          upstream = await fetch(fetchUrl, {
            redirect: "follow",
            headers: { "User-Agent": "ACD-Archive-Downloader/1.0" },
            cache: "no-store",
          });
        } catch {
          lastStatus = 502;
          continue;
        }

        if (!upstream.ok || !upstream.body) {
          lastStatus = upstream.status || 502;
          continue;
        }

        const contentType = upstream.headers.get("content-type") || "";
        const isHtml = /text\/html/i.test(contentType);
        const isJson = /application\/(json|ld\+json)/i.test(contentType);
        const isDrive = /drive\.google\.com|drive\.usercontent\.google\.com/i.test(fetchUrl) || !!extractDriveId(remoteUrl);

        // Drive share pages / virus-scan interstitials return HTML, not the file
        if (isHtml && isDrive) {
          continue;
        }
        // Do not stream web pages or API/JSON payloads (e.g. misconfigured link pointing to site/product page)
        if (isHtml || isJson) {
          sawNonFile = true;
          continue;
        }

        await incrementDownloadCount(downloadLink.id);

        const headers: Record<string, string> = {
          "Content-Type": contentType || "application/octet-stream",
          "Content-Disposition": `attachment; filename="${encodeURIComponent(displayName)}"; filename*=UTF-8''${encodeURIComponent(displayName)}`,
          "Cache-Control": "no-store, no-cache, must-revalidate",
        };

        const length = upstream.headers.get("content-length");
        if (length) headers["Content-Length"] = length;

        return new NextResponse(upstream.body, { status: 200, headers });
      }

      if (sawNonFile) {
        return errorResponse(
          "Link tải nội bộ không trỏ tới file tải trực tiếp (đang trả về trang web/dữ liệu). Vui lòng cấu hình link file trực tiếp (Google Drive file công khai, Dropbox/CDN/storage).",
          502
        );
      }

      if (extractDriveId(remoteUrl)) {
        return errorResponse(
          "Không thể tải file từ Google Drive. Vui lòng kiểm tra: (1) file đã ở chế độ 'Anyone with the link' (Viewer), (2) không phải link thư mục, (3) file không yêu cầu xác nhận tải lớn đặc biệt. Nên dùng link tải trực tiếp (CDN/storage) nếu có.",
          502
        );
      }

      return errorResponse(
        `Không thể tải file từ liên kết nguồn (HTTP ${lastStatus}). Vui lòng kiểm tra link tải nội bộ hoặc liên hệ quản trị.`,
        502
      );
    }

    return errorResponse(
      "Sản phẩm chưa có nguồn tải khả dụng. Vui lòng liên hệ quản trị viên.",
      404
    );
  } catch (error) {
    console.error("Download route error:", error);
    const accept = request.headers.get("accept") || "";
    const wantsJson = accept.includes("application/json") && !accept.includes("text/html");
    const msg = "Đã có lỗi xảy ra trong quá trình tải file.";
    if (wantsJson) {
      return NextResponse.json({ error: msg }, { status: 500 });
    }
    return new NextResponse(
      `<!doctype html><html lang="vi"><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/><title>Không thể tải file</title><body style="font-family:system-ui;background:#0b1220;color:#e5e7eb;padding:40px"><h2>Không thể tải file</h2><p>${msg}</p></body></html>`,
      { status: 500, headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store", "Content-Disposition": "inline" } }
    );
  }
}

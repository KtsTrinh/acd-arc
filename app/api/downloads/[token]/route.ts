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

export async function GET(
  request: Request,
  { params }: { params: { token: string } }
) {
  try {
    const { token } = params;

    // 1. Xác thực người dùng đang đăng nhập (bắt buộc)
    const user = await getCurrentUser();

    const wantsHtml = (request.headers.get("accept") || "").includes("text/html");
    const errorResponse = (message: string, status: number) => {
      if (wantsHtml) {
        return new NextResponse(
          `<!doctype html><html lang="vi"><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/><title>Không thể tải file</title><body style="font-family:system-ui;background:#0b1220;color:#e5e7eb;padding:40px;line-height:1.6"><h2 style="margin:0 0 12px">Không thể tải file</h2><p style="margin:0">${message}</p></body></html>`,
          { status, headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store" } }
        );
      }
      return NextResponse.json({ error: message }, { status });
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

    // 3. Tăng bộ đếm lượt tải
    await incrementDownloadCount(downloadLink.id);

    // 4. Nguồn file: file trong storage/private HOẶC link nội bộ do admin cấu hình
    const fileKey = product.fileKey;
    const remoteUrl = product.downloadLinkUrl;
    const displayName = sanitizeFileName(
      product.fileName ||
        (fileKey ? path.basename(fileKey) : product.name)
    );

    if (fileKey) {
      const filePath = getPrivateFilePath(fileKey);
      if (filePath) {
        const stat = fs.statSync(filePath);
        const stream = Readable.toWeb(
          fs.createReadStream(filePath)
        ) as unknown as ReadableStream;

        return new NextResponse(stream, {
          status: 200,
          headers: {
            "Content-Disposition": `attachment; filename="${displayName}"`,
            "Content-Type": "application/octet-stream",
            "Content-Length": stat.size.toString(),
            "Cache-Control": "no-store, no-cache, must-revalidate",
          },
        });
      }
    }

    if (remoteUrl && isSafeRemoteUrl(remoteUrl)) {
      // Proxy qua máy chủ: khách KHÔNG bao giờ nhìn thấy link gốc do admin cấu hình
      let fetchUrl = remoteUrl;
      try {
        const driveFile = remoteUrl.match(/drive\.google\.com\/(?:file\/d\/|open\?id=|uc\?id=)([a-zA-Z0-9_-]+)/);
        if (driveFile) {
          fetchUrl = `https://drive.google.com/uc?export=download&id=${driveFile[1]}`;
        }
      } catch {
        /* ignore */
      }

      const upstream = await fetch(fetchUrl, {
        redirect: "follow",
        headers: { "User-Agent": "ACD-Archive-Downloader/1.0" },
        cache: "no-store",
      });

      if (!upstream.ok || !upstream.body) {
        return errorResponse("Tài nguyên tải về đang được hệ thống bảo trì hoặc chuẩn bị cập nhật.", 502);
      }

      const contentType = upstream.headers.get("content-type") || "";
      // Nếu link chia sẻ Drive trả về trang HTML (chưa public/lỗi), không stream HTML giả dạng file
      if (/text\/html/i.test(contentType) && /drive\.google\.com/i.test(fetchUrl)) {
        return errorResponse(
          "Không thể tải file từ liên kết nguồn. Vui lòng kiểm tra link tải nội bộ (Drive phải ở chế độ Anyone with the link) hoặc liên hệ quản trị.",
          502
        );
      }

      const headers: Record<string, string> = {
        "Content-Type": contentType || "application/octet-stream",
        "Content-Disposition": `attachment; filename="${displayName}"`,
        "Cache-Control": "no-store, no-cache, must-revalidate",
      };

      const length = upstream.headers.get("content-length");
      if (length) headers["Content-Length"] = length;

      return new NextResponse(upstream.body, { status: 200, headers });
    }

    return errorResponse("Tài nguyên tải về đang được hệ thống bảo trì hoặc chuẩn bị cập nhật.", 404);
  } catch (error) {
    console.error("Download route error:", error);
    const wantsHtml = (request.headers.get("accept") || "").includes("text/html");
    if (wantsHtml) {
      return new NextResponse(
        `<!doctype html><html lang="vi"><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/><title>Không thể tải file</title><body style="font-family:system-ui;background:#0b1220;color:#e5e7eb;padding:40px;line-height:1.6"><h2 style="margin:0 0 12px">Không thể tải file</h2><p style="margin:0">Đã có lỗi xảy ra trong quá trình tải file.</p></body></html>`,
        { status: 500, headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store" } }
      );
    }
    return NextResponse.json(
      { error: "Đã có lỗi xảy ra trong quá trình tải file." },
      { status: 500 }
    );
  }
}

import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { createMediaItem } from "@/lib/storage";
import { DRIVE_FOLDER_REGEX } from "@/lib/media-url";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36";

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || (user.role !== "ADMIN" && user.role !== "SUPER_ADMIN")) {
      return NextResponse.json(
        { error: "Chỉ quản trị viên mới được thực hiện thao tác này." },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { url, folder = "drive" } = body;

    if (!url) {
      return NextResponse.json({ error: "Vui lòng cung cấp link thư mục Google Drive." }, { status: 400 });
    }

    const match = url.match(DRIVE_FOLDER_REGEX);
    if (!match) {
      return NextResponse.json({ error: "Link không phải là thư mục Google Drive hợp lệ." }, { status: 400 });
    }

    const folderId = match[1];

    // 1. Thử dùng Google Drive API công khai (nếu có API key hợp lệ) - bỏ qua nếu key sai
    const apiKey = process.env.GOOGLE_DRIVE_API_KEY;
    if (apiKey) {
      const apiRes = await fetch(
        `https://www.googleapis.com/drive/v3/files?q=%27${folderId}%27+in+parents+and+(mimeType+contains+%27image%2F%27+or+mimeType+contains+%27video%2F%27)&fields=files(id,name,mimeType)&pageSize=100&key=${apiKey}`,
        {
          headers: { "User-Agent": USER_AGENT },
          cache: "no-store",
        }
      ).catch(() => null);

      if (apiRes && apiRes.ok) {
        const apiData = await apiRes.json();
        const files = (apiData.files || []).filter(
          (f: any) => f.mimeType?.startsWith("image/") || f.mimeType?.startsWith("video/")
        );

        const results = [];
        for (const file of files) {
          try {
            const isVideo = file.mimeType?.startsWith("video/");
            const fileUrl = isVideo
              ? `/api/media/stream?url=${encodeURIComponent(`https://drive.google.com/uc?export=view&id=${file.id}`)}`
              : `https://drive.google.com/uc?export=view&id=${file.id}`;

            const media = await createMediaItem({
              filename: file.name || `drive_${file.id}`,
              originalName: file.name || `Google Drive ${file.id}`,
              mimeType: file.mimeType || (isVideo ? "video/mp4" : "image/jpeg"),
              size: 0,
              url: fileUrl,
              folder,
              alt: file.name?.replace(/\.[^/.]+$/, "") || "ACD Media",
            });
            results.push(media);
          } catch (e) {}
        }
        return NextResponse.json({ success: true, count: results.length, total: files.length, media: results });
      }
    }

    // 2. Fallback: cào HTML để lấy danh sách file thực tế
    const res = await fetch(`https://drive.google.com/drive/folders/${folderId}`, {
      headers: {
        "User-Agent": USER_AGENT,
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      },
      cache: "no-store",
    });

    if (!res.ok) {
      return NextResponse.json({ error: "Không thể truy cập thư mục. Vui lòng đảm bảo đã chia sẻ công khai." }, { status: 400 });
    }

    const html = await res.text();
    const fileMap = new Map<string, { name?: string }>();

    // Tìm các file/d/ID với tên file gần đó
    const fileRegex = /\/file\/d\/([a-zA-Z0-9_-]{25,})\/[^"']*?"[^"]*?title":"([^"\\]+)"/g;
    let matchFile: RegExpExecArray | null;
    while ((matchFile = fileRegex.exec(html)) !== null) {
      const id = matchFile[1];
      if (id === folderId) continue;
      let name = matchFile[2];
      try {
        name = decodeURIComponent(name.replace(/\\u([0-9a-fA-F]{4})/g, (_, hex) => String.fromCharCode(parseInt(hex, 16))));
      } catch {}
      fileMap.set(id, { name });
    }

    // Fallback patterns nếu không tìm thấy tên
    if (fileMap.size === 0) {
      const patterns = [/\/file\/d\/([a-zA-Z0-9_-]{25,})/g];
      for (const p of patterns) {
        let m: RegExpExecArray | null;
        while ((m = p.exec(html)) !== null) {
          const id = m[1];
          if (id === folderId || id.length < 25) continue;
          if (!fileMap.has(id)) {
            fileMap.set(id, {});
          }
        }
      }
    }

    const ids = Array.from(fileMap.keys()).slice(0, 100);
    if (ids.length === 0) {
      return NextResponse.json({ error: "Không tìm thấy tệp tin phương tiện phù hợp." }, { status: 400 });
    }

    const results = [];
    for (const id of ids) {
      try {
        const info = fileMap.get(id) || {};
        const name = info.name || `drive_${id.substring(0, 8)}`;
        const lower = name.toLowerCase();
        const isVideo = lower.endsWith(".mp4") || lower.endsWith(".webm") || lower.endsWith(".mov") || lower.endsWith(".m4v") || lower.endsWith(".ogv");
        const isImage = lower.endsWith(".jpg") || lower.endsWith(".jpeg") || lower.endsWith(".png") || lower.endsWith(".gif") || lower.endsWith(".webp") || lower.endsWith(".avif") || lower.endsWith(".bmp") || lower.endsWith(".svg");

        if (!isVideo && !isImage) {
          // Nếu không rõ đuôi, vẫn thử thêm nhưng sẽ để UI xử lý
        }

        const fileUrl = isVideo
          ? `/api/media/stream?url=${encodeURIComponent(`https://drive.google.com/uc?export=view&id=${id}`)}`
          : `https://drive.google.com/uc?export=view&id=${id}`;

        const mimeType = isVideo
          ? lower.endsWith(".webm")
            ? "video/webm"
            : lower.endsWith(".mov")
              ? "video/quicktime"
              : "video/mp4"
          : lower.endsWith(".png")
            ? "image/png"
            : lower.endsWith(".webp")
              ? "image/webp"
              : lower.endsWith(".gif")
                ? "image/gif"
                : "image/jpeg";

        const media = await createMediaItem({
          filename: name,
          originalName: name,
          mimeType,
          size: 0,
          url: fileUrl,
          folder,
          alt: name.replace(/\.[^/.]+$/, "") || "ACD Media",
        });
        results.push(media);
      } catch (e) {}
    }

    return NextResponse.json({ success: true, count: results.length, total: ids.length, media: results });
  } catch (error: any) {
    console.error("Import drive folder error:", error);
    return NextResponse.json({ error: "Lỗi khi import thư mục Google Drive." }, { status: 500 });
  }
}

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

    // Try to fetch public folder page
    const res = await fetch(`https://drive.google.com/drive/folders/${folderId}`, {
      headers: {
        "User-Agent": USER_AGENT,
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
        "Accept-Language": "vi-VN,vi;q=0.9,en-US;q=0.8,en;q=0.7",
        "Referer": "https://drive.google.com/",
      },
      cache: "no-store",
      redirect: "follow",
    });

    if (!res.ok) {
      return NextResponse.json(
        { error: "Không thể truy cập thư mục. Vui lòng đảm bảo thư mục đã bật 'Bất kỳ ai có liên kết đều có thể xem'." },
        { status: 400 }
      );
    }

    const html = await res.text();

    // Extract file IDs
    const ids = new Set<string>();
    const patterns = [
      /\/file\/d\/([a-zA-Z0-9_-]{25,})/g,
      /\["([a-zA-Z0-9_-]{25,})","/g,
      /id['"]\s*[:=]\s*['"]([a-zA-Z0-9_-]{25,})['"]/g,
    ];

    for (const pattern of patterns) {
      let m;
      while ((m = pattern.exec(html)) !== null) {
        const id = m[1];
        if (id && id !== folderId && id.length >= 25 && id.length <= 60) {
          ids.add(id);
        }
      }
    }

    const files = Array.from(ids).slice(0, 100).map((id) => ({
      id,
      name: `drive_${id.substring(0, 8)}.jpg`,
      mimeType: "image/jpeg",
    }));

    if (files.length === 0) {
      return NextResponse.json(
        { error: "Không tìm thấy ảnh. Google đã chặn việc trích xuất. Vui lòng tải thủ công từng ảnh hoặc sử dụng link ảnh trực tiếp." },
        { status: 400 }
      );
    }

    const results = [];
    for (const file of files) {
      try {
        const fileUrl = `https://lh3.googleusercontent.com/d/${file.id}=w2048`;
        const media = await createMediaItem({
          filename: file.name,
          originalName: `Google Drive ${file.id}`,
          mimeType: file.mimeType,
          size: 0,
          url: fileUrl,
          folder,
          alt: "ACD Media",
        });
        results.push(media);
      } catch (e) {
        console.error(e);
      }
    }

    return NextResponse.json({ success: true, count: results.length, total: files.length, media: results });
  } catch (error: any) {
    console.error("Import drive folder error:", error);
    return NextResponse.json({ error: "Lỗi khi import thư mục Google Drive." }, { status: 500 });
  }
}

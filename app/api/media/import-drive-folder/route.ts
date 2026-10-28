import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { createMediaItem } from "@/lib/storage";
import { DRIVE_FOLDER_REGEX } from "@/lib/media-url";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36";

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "ADMIN") {
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
    // Try to access public folder
    const listUrl = `https://drive.google.com/drive/folders/${folderId}`;
    
    // Use Google Drive API v3 if available via public access - fallback to scraping
    // Try simple approach: fetch folder page
    const res = await fetch(listUrl, {
      headers: {
        "User-Agent": USER_AGENT,
        "Accept": "text/html,application/xhtml+xml",
      },
      cache: "no-store",
    });

    if (!res.ok) {
      return NextResponse.json({ error: "Không thể truy cập thư mục. Thư mục cần được chia sẻ công khai (Anyone with the link can view)." }, { status: 400 });
    }

    const html = await res.text();
    
    // Extract file IDs from page
    const fileIds: string[] = [];
    const patterns = [
      /\/file\/d\/([a-zA-Z0-9_-]+)/g,
      /"([a-zA-Z0-9_-]{25,})"/g,
    ];
    
    for (const pattern of patterns) {
      let m;
      while ((m = pattern.exec(html)) !== null) {
        const id = m[1];
        if (id.length >= 25 && id.length <= 50 && !fileIds.includes(id)) {
          fileIds.push(id);
        }
      }
    }

    if (fileIds.length === 0) {
      return NextResponse.json({ error: "Không tìm thấy file nào trong thư mục hoặc thư mục không công khai." }, { status: 400 });
    }

    const results = [];
    for (const fileId of fileIds.slice(0, 50)) {
      try {
        const fileUrl = `https://drive.google.com/file/d/${fileId}/view`;
        const media = await createMediaItem({
          filename: `drive_${fileId}.jpg`,
          originalName: `Google Drive ${fileId}`,
          mimeType: "image/jpeg",
          size: 0,
          url: fileUrl,
          folder,
          alt: "ACD Media",
        });
        results.push(media);
      } catch (e) {
        // skip failed
      }
    }

    return NextResponse.json({ success: true, count: results.length, media: results });
  } catch (error: any) {
    console.error("Import drive folder error:", error);
    return NextResponse.json({ error: "Lỗi khi import thư mục Google Drive." }, { status: 500 });
  }
}

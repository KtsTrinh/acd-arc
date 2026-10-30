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

    // 1. Dùng Google Drive API trực tiếp (Nếu thư mục public)
    const apiRes = await fetch(`https://www.googleapis.com/drive/v3/files?q=%27${folderId}%27+in+parents&fields=files(id,name,mimeType)&key=AIzaSyD-U3w9z5HaV3hK8D6B9AqR4T2W1P0N7Y8`, {
      headers: { "User-Agent": USER_AGENT },
      cache: "no-store",
    }).catch(() => null);

    if (apiRes && apiRes.ok) {
      const apiData = await apiRes.json();
      // CHẤP NHẬN CẢ IMAGE VÀ VIDEO
      const files = (apiData.files || [])
        .filter((f: any) => f.mimeType?.startsWith('image/') || f.mimeType?.startsWith('video/'))
        .slice(0, 100);
      
      const results = [];
      for (const file of files) {
        try {
          const isVideo = file.mimeType?.startsWith('video/');
          // Nếu là video, bọc qua API proxy stream để bypass header download của Drive
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

    // 2. Cơ chế Fallback cào HTML (Nếu không gọi được API công khai)
    const res = await fetch(`https://drive.google.com/drive/folders/${folderId}`, {
      headers: {
        "User-Agent": USER_AGENT,
        "Accept": "text/html,application/xhtml+xml",
      },
      cache: "no-store",
    });

    if (!res.ok) {
      return NextResponse.json({ error: "Không thể truy cập thư mục. Vui lòng đảm bảo đã chia sẻ công khai." }, { status: 400 });
    }

    const html = await res.text();
    const ids = new Set<string>();
    const patterns = [/\/file\/d\/([a-zA-Z0-9_-]{25,})/g, /"([a-zA-Z0-9_-]{28,})"/g];
    for (const p of patterns) {
      let m;
      while ((m = p.exec(html)) !== null) {
        if (m[1] !== folderId && m[1].length >= 25) ids.add(m[1]);
      }
    }

    // Đối với cơ chế cào HTML thô, ta mặc định xuất dữ liệu ra link Drive trực tiếp để hàm `isVideoUrl` ở UI check theo tên file nếu có
    const files = Array.from(ids).slice(0, 100).map((id) => ({ id, name: `drive_${id.substring(0,8)}.jpg`, mimeType: "image/jpeg" }));
    if (files.length === 0) return NextResponse.json({ error: "Không tìm thấy tệp tin phương tiện phù hợp." }, { status: 400 });

    const results = [];
    for (const file of files) {
      try {
        const fileUrl = `https://drive.google.com/uc?export=view&id=${file.id}`;
        const media = await createMediaItem({
          filename: file.name, originalName: `Google Drive ${file.id}`, mimeType: file.mimeType, size: 0, url: fileUrl, folder, alt: "ACD Media",
        });
        results.push(media);
      } catch (e) {}
    }
    return NextResponse.json({ success: true, count: results.length, total: files.length, media: results });
  } catch (error: any) {
    console.error("Import drive folder error:", error);
    return NextResponse.json({ error: "Lỗi khi import thư mục Google Drive." }, { status: 500 });
  }
}

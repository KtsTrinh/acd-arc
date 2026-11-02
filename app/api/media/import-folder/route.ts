import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36";

export async function GET(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || (user.role !== "ADMIN" && user.role !== "SUPER_ADMIN")) {
      return NextResponse.json(
        { error: "Chỉ quản trị viên mới được thực hiện thao tác này." },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const folderId = searchParams.get("folderId");

    if (!folderId) {
      return NextResponse.json(
        { error: "Vui lòng cung cấp folderId của Google Drive." },
        { status: 400 }
      );
    }

    const apiKey = process.env.GOOGLE_DRIVE_API_KEY;

    if (apiKey) {
      try {
        const query = encodeURIComponent(
          `'${folderId}' in parents and trashed=false and (mimeType contains 'image/' or mimeType contains 'video/')`
        );
        const apiRes = await fetch(
          `https://www.googleapis.com/drive/v3/files?q=${query}&fields=files(id,name,mimeType,webContentLink,thumbnailLink)&pageSize=100&key=${apiKey}`,
          {
            headers: { "User-Agent": USER_AGENT },
            cache: "no-store",
          }
        );

        if (apiRes.ok) {
          const apiData = await apiRes.json();
          const files = (apiData.files || []).filter(
            (f: any) =>
              f.mimeType?.startsWith("image/") || f.mimeType?.startsWith("video/")
          );

          const images: string[] = [];
          const filesList: Array<{ id: string; name: string; url: string; mimeType?: string }> = [];

          for (const file of files) {
            const isVideo = file.mimeType?.startsWith("video/");
            const directUrl = isVideo
              ? `https://drive.google.com/uc?export=download&id=${file.id}`
              : `https://drive.google.com/uc?export=view&id=${file.id}`;
            const previewUrl = `https://drive.google.com/uc?export=view&id=${file.id}`;

            if (!isVideo) {
              images.push(previewUrl);
            }
            filesList.push({
              id: file.id,
              name: file.name || `drive_${file.id}`,
              url: previewUrl,
              mimeType: file.mimeType,
            });
          }

          return NextResponse.json({
            success: true,
            images,
            files: filesList,
            count: filesList.length,
          });
        }
      } catch (apiError) {
        console.error("Google Drive API error:", apiError);
      }
    }

    try {
      const res = await fetch(
        `https://drive.google.com/drive/folders/${folderId}`,
        {
          headers: {
            "User-Agent": USER_AGENT,
            Accept:
              "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
          },
          cache: "no-store",
        }
      );

      if (!res.ok) {
        return NextResponse.json(
          {
            error:
              "Không thể truy cập thư mục. Vui lòng đảm bảo thư mục đã được chia sẻ 'Anyone with the link can view'.",
          },
          { status: 400 }
        );
      }

      const html = await res.text();
      const fileMap = new Map<string, { name?: string }>();

      const fileRegex =
        /\/file\/d\/([a-zA-Z0-9_-]{25,})\/[^"']*?"[^"]*?title":"([^"\\]+)"/g;
      let matchFile: RegExpExecArray | null;
      while ((matchFile = fileRegex.exec(html)) !== null) {
        const id = matchFile[1];
        if (id === folderId) continue;
        let name = matchFile[2];
        try {
          name = decodeURIComponent(
            name.replace(/\\u([0-9a-fA-F]{4})/g, (_, hex) =>
              String.fromCharCode(parseInt(hex, 16))
            )
          );
        } catch {}
        fileMap.set(id, { name });
      }

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
        return NextResponse.json(
          { error: "Không tìm thấy tệp tin phương tiện phù hợp trong thư mục." },
          { status: 400 }
        );
      }

      const images: string[] = [];
      const videos: string[] = [];
      const files: Array<{ id: string; name: string; url: string }> = [];

      for (const id of ids) {
        const info = fileMap.get(id) || {};
        const name = info.name || `drive_${id.substring(0, 8)}`;
        const lower = name.toLowerCase();
        const isImage =
          lower.endsWith(".jpg") ||
          lower.endsWith(".jpeg") ||
          lower.endsWith(".png") ||
          lower.endsWith(".gif") ||
          lower.endsWith(".webp") ||
          lower.endsWith(".avif") ||
          lower.endsWith(".bmp") ||
          lower.endsWith(".svg");
        const isVideo =
          lower.endsWith(".mp4") ||
          lower.endsWith(".webm") ||
          lower.endsWith(".mov") ||
          lower.endsWith(".avi") ||
          lower.endsWith(".mkv") ||
          lower.endsWith(".m4v") ||
          lower.endsWith(".ogv");

        const previewUrl = `https://drive.google.com/uc?export=view&id=${id}`;

        if (isImage) {
          images.push(previewUrl);
        }
        if (isVideo) {
          videos.push(previewUrl);
        }
        files.push({
          id,
          name,
          url: previewUrl,
        });
      }

      return NextResponse.json({
        success: true,
        images,
        videos,
        files,
        count: files.length,
      });
    } catch (scrapeError) {
      console.error("Drive scrape error:", scrapeError);
      return NextResponse.json(
        { error: "Lỗi khi lấy danh sách tệp từ Google Drive." },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error("Import folder route error:", error);
    return NextResponse.json(
      { error: "Lỗi hệ thống khi xử lý yêu cầu." },
      { status: 500 }
    );
  }
}

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
    const { url, folderId: bodyFolderId } = body;
    let folderId = bodyFolderId;

    if (!folderId && url) {
      const match = url.match(/\/folders\/([a-zA-Z0-9_-]+)/);
      if (match) {
        folderId = match[1];
      } else {
        const idMatch = url.match(/[?&]id=([a-zA-Z0-9_-]+)/);
        if (idMatch && /folders/i.test(url)) {
          folderId = idMatch[1];
        }
      }
    }

    if (!folderId) {
      return NextResponse.json(
        { error: "Vui lòng cung cấp folderId hoặc link thư mục Google Drive hợp lệ." },
        { status: 400 }
      );
    }

    const req = new Request(
      `${request.url.split("?")[0]}?folderId=${encodeURIComponent(folderId)}`,
      { method: "GET" }
    );
    return GET(req);
  } catch (error: any) {
    console.error("Import folder POST error:", error);
    return NextResponse.json(
      { error: "Lỗi hệ thống khi xử lý yêu cầu." },
      { status: 500 }
    );
  }
}

import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { createMediaItem } from "@/lib/storage";
import { DRIVE_FOLDER_REGEX } from "@/lib/media-url";
import { google } from "googleapis";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

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

    const clientEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
    const privateKey = process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY;

    if (!clientEmail || !privateKey) {
      return NextResponse.json(
        { error: "Chưa cấu hình Google Service Account. Vui lòng thêm GOOGLE_SERVICE_ACCOUNT_EMAIL và GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY vào file .env" },
        { status: 500 }
      );
    }

    const auth = new google.auth.JWT({
      email: clientEmail,
      key: privateKey.replace(/\\n/g, "\n"),
      scopes: ["https://www.googleapis.com/auth/drive.readonly"],
    });

    const drive = google.drive({ version: "v3", auth });

    const listRes = await drive.files.list({
      q: `'${folderId}' in parents and trashed=false`,
      fields: "files(id, name, mimeType, size)",
      pageSize: 1000,
      includeItemsFromAllDrives: true,
      supportsAllDrives: true,
    });

    const files = listRes.data.files || [];

    if (files.length === 0) {
      return NextResponse.json(
        { error: "Không tìm thấy file nào. Hãy đảm bảo đã chia sẻ thư mục với email Service Account với quyền Viewer." },
        { status: 400 }
      );
    }

    const results = [];

    for (const file of files) {
      try {
        if (!file.mimeType?.startsWith("image/") && !file.mimeType?.startsWith("video/")) {
          continue;
        }

        const fileUrl = `https://drive.google.com/file/d/${file.id}/view`;
        const mimeType = file.mimeType || "image/jpeg";

        const media = await createMediaItem({
          filename: file.name || `drive_${file.id}`,
          originalName: file.name || `Google Drive ${file.id}`,
          mimeType,
          size: file.size ? parseInt(file.size) : 0,
          url: fileUrl,
          folder,
          alt: file.name?.replace(/\.[^/.]+$/, "") || "ACD Media",
        });

        results.push(media);
      } catch (e) {
        console.error("Error importing file:", file.id, e);
      }
    }

    return NextResponse.json({
      success: true,
      count: results.length,
      total: files.length,
      media: results,
    });
  } catch (error: any) {
    console.error("Import drive folder error:", error);
    return NextResponse.json(
      { error: error.message || "Lỗi khi import thư mục Google Drive." },
      { status: 500 }
    );
  }
}

import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { createMediaItem } from "@/lib/storage";
import { DRIVE_FOLDER_REGEX } from "@/lib/media-url";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    // 1. Kiểm tra phân quyền quản trị viên
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

    // 2. Trích xuất Folder ID từ URL dán vào
    const match = url.match(DRIVE_FOLDER_REGEX);
    if (!match) {
      return NextResponse.json({ error: "Link không phải là thư mục Google Drive hợp lệ." }, { status: 400 });
    }

    const folderId = match[1];

    // 3. Gửi request cào mã nguồn HTML công khai của thư mục nhúng (Embedded)
    const drivePublicUrl = `https://google.com{folderId}`;
    const res = await fetch(drivePublicUrl, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      },
      cache: "no-store",
    });

    if (!res.ok) {
      return NextResponse.json(
        { error: "Không thể kết nối tới Google Drive. Hãy đảm bảo thư mục đã bật quyền xem công khai." },
        { status: 400 }
      );
    }

    const htmlContent = await res.text();

    // 4. Quét tìm toàn bộ chuỗi ID, tên file và định dạng file từ HTML trả về
    const regex = /\["([a-zA-Z0-9_-]{25,})","([^"]+)",(?:null|"[^"]+"),"([^"]+)"\]/g;
    const files: any[] = [];
    let matchArray;

    while ((matchArray = regex.exec(htmlContent)) !== null) {
      const [_, id, name, mimeType] = matchArray;

      // Loại bỏ trùng lặp và chỉ chấp nhận định dạng ảnh/video
      const isDuplicate = files.some((f) => f.id === id);
      const isMedia = mimeType.includes("image/") || mimeType.includes("video/");

      if (!isDuplicate && isMedia) {
        files.push({ id, name, mimeType });
      }
    }

    if (files.length === 0) {
      return NextResponse.json(
        { error: "Không tìm thấy file ảnh hoặc video nào. Hãy đảm bảo thư mục đã được cấu hình 'Bất kỳ ai có liên kết đều có thể xem'." },
        { status: 400 }
      );
    }

    const results = [];

    // 5. Vòng lặp tự động insert hàng loạt (Bulk Insert) dữ liệu vào database hệ thống
    for (const file of files) {
      try {
        const fileUrl = `https://drive.google.com/file/d/${file.id}/view`;

        const media = await createMediaItem({
          filename: file.name || `drive_${file.id}`,
          originalName: file.name || `Google Drive ${file.id}`,
          mimeType: file.mimeType || "image/jpeg",
          size: 0, // Cào HTML không trả về size trực tiếp, gán mặc định bằng 0
          url: fileUrl,
          folder,
          alt: file.name?.replace(/\.[^/.]+$/, "") || "ACD Media",
        });

        results.push(media);
      } catch (e) {
        console.error("Lỗi khi import file đơn lẻ từ Drive:", file.id, e);
      }
    }

    // 6. Trả kết quả thống kê về cho Frontend
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

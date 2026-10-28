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

    // 3. Gửi request lấy nội dung trang hiển thị công khai để bóc dữ liệu
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

    // 4. SỬ DỤNG REGEX ĐỔI MỚI: Bóc tách chính xác mảng dữ liệu cấu trúc tệp tin của Google Drive
    // Chuỗi khởi tạo tệp tin của Google Drive có cấu trúc ID bắt đầu bằng ký tự chuẩn và độ dài chuỗi cố định
    const regex = /"([a-zA-Z0-9_-]{33})"/g;
    const files: any[] = [];
    let matchArray;

    while ((matchArray = regex.exec(htmlContent)) !== null) {
      const id = matchArray[1];

      // Lọc bỏ các ID hệ thống trùng lặp hoặc ID của chính thư mục cha
      if (id !== folderId && !files.some((f) => f.id === id)) {
        // Tạo tên tệp tin tạm thời từ chuỗi ID ngẫu nhiên
        const fallbackName = `drive_image_${id.substring(0, 6)}.jpg`;
        files.push({
          id,
          name: fallbackName,
          mimeType: "image/jpeg"
        });
      }
    }

    if (files.length === 0) {
      return NextResponse.json(
        { error: "Không tìm thấy dữ liệu tệp tin. Hãy đảm bảo thư mục đã được cấu hình 'Bất kỳ ai có liên kết đều có thể xem'." },
        { status: 400 }
      );
    }

    const results = [];

    // 5. Sử dụng cổng trích xuất xuất ảnh thô công khai (uc?export=view) để bypass hotlinking
    for (const file of files) {
      try {
        const fileUrl = `https://google.com{file.id}`;

        const media = await createMediaItem({
          filename: file.name,
          originalName: `Google Drive ${file.id}`,
          mimeType: file.mimeType,
          size: 0,
          url: fileUrl, // Lưu link công khai tuyệt đối vào DB để mọi Client đều xem được
          folder,
          alt: "ACD Architecture Media",
        });

        results.push(media);
      } catch (e) {
        console.error("Lỗi khi import file đơn lẻ từ Drive:", file.id, e);
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

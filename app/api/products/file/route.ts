import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { savePrivateProductFile } from "@/lib/storage";

export const dynamic = "force-dynamic";

/** Giới hạn dung lượng upload trực tiếp (Vercel serverless giới hạn ~4.5MB request) */
const MAX_UPLOAD_BYTES = 4 * 1024 * 1024;

/**
 * Upload file bản quyền cho mục Danh Mục Sản Phẩm.
 * File được lưu ở storage/private (KHÔNG public) và chỉ tải được
 * qua /api/downloads/[token] sau khi khách đã thanh toán.
 * Với file lớn, quản trị viên dán link nội bộ (Google Drive/Dropbox/CDN)
 * vào trường "Link tải nội bộ" - link đó cũng được phát qua proxy của máy chủ.
 */
export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || (user.role !== "ADMIN" && user.role !== "SUPER_ADMIN")) {
      return NextResponse.json(
        { error: "Chỉ quản trị viên mới được tải file lên." },
        { status: 403 }
      );
    }

    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        { error: "Không tìm thấy file để tải lên." },
        { status: 400 }
      );
    }

    if (file.size > MAX_UPLOAD_BYTES) {
      return NextResponse.json(
        {
          error:
            "File vượt quá 4MB. Với file lớn, hãy dán link tải nội bộ (Google Drive/Dropbox/CDN) vào ô Link tải nội bộ.",
        },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const { storageKey, fileSize } = await savePrivateProductFile(
      file.name,
      buffer
    );

    return NextResponse.json({
      success: true,
      fileKey: storageKey,
      fileName: file.name,
      fileSize,
    });
  } catch (error) {
    console.error("Upload private file error:", error);
    return NextResponse.json(
      { error: "Lỗi trong quá trình tải file lên." },
      { status: 500 }
    );
  }
}

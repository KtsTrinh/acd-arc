import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { savePrivateProductFile, getPrivateFilePath } from "@/lib/storage";
import { prisma } from "@/lib/prisma";
import fs from "fs";

export const dynamic = "force-dynamic";

/** Giới hạn dung lượng upload trực tiếp */
const MAX_UPLOAD_BYTES = 4 * 1024 * 1024;

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || (user.role !== "ADMIN" && user.role !== "SUPER_ADMIN")) {
      return NextResponse.json({ error: "Chỉ quản trị viên mới được tải file lên." }, { status: 403 });
    }
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    if (!file) {
      return NextResponse.json({ error: "Không tìm thấy file để tải lên." }, { status: 400 });
    }
    if (file.size > MAX_UPLOAD_BYTES) {
      return NextResponse.json({ error: "File vượt quá 4MB. Với file lớn, hãy dán link tải nội bộ." }, { status: 400 });
    }
    const buffer = Buffer.from(await file.arrayBuffer());
    const { storageKey, fileSize } = await savePrivateProductFile(file.name, buffer);
    return NextResponse.json({ success: true, fileKey: storageKey, fileName: file.name, fileSize });
  } catch (error) {
    console.error("Upload private file error:", error);
    return NextResponse.json({ error: "Lỗi trong quá trình tải file lên." }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || (user.role !== "ADMIN" && user.role !== "SUPER_ADMIN")) {
      return NextResponse.json({ error: "Không có quyền." }, { status: 403 });
    }
    const body = await request.json().catch(() => ({}));
    const productId = body?.productId;
    if (!productId) {
      return NextResponse.json({ error: "Thiếu productId." }, { status: 400 });
    }
    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product) {
      return NextResponse.json({ error: "Không tìm thấy sản phẩm." }, { status: 404 });
    }
    const fileKey = product.fileKey;
    if (fileKey) {
      const filePath = getPrivateFilePath(fileKey);
      if (filePath) {
        try {
          if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
        } catch (e) {
          console.error("Delete file error:", e);
        }
      }
    }
    await prisma.product.update({
      where: { id: productId },
      data: { fileKey: null, fileName: null, fileSize: null },
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete private file error:", error);
    return NextResponse.json({ error: "Lỗi khi xóa file." }, { status: 500 });
  }
}

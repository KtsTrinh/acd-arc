import { NextResponse } from "next/server";
import { validateDownloadToken, incrementDownloadCount } from "@/lib/downloads";
import { getPrivateFilePath } from "@/lib/storage";
import fs from "fs";
import path from "path";

export async function GET(
  request: Request,
  { params }: { params: { token: string } }
) {
  try {
    const { token } = params;

    // 1. Validate token, expiry, paid status, and download count
    const validation = await validateDownloadToken(token);
    if (!validation.valid || !validation.downloadLink) {
      return NextResponse.json(
        { error: validation.error || "Liên kết không hợp lệ." },
        { status: 403 }
      );
    }

    const { downloadLink } = validation;
    const product = downloadLink.product;

    // Check if product has a private file key
    const fileKey = product.fileKey || "cad/villa-modern-full-cad-pack.zip";
    const filePath = getPrivateFilePath(fileKey);

    if (!filePath || !fs.existsSync(filePath)) {
      return NextResponse.json(
        { error: "Tài nguyên tải về đang được hệ thống bảo trì hoặc chuẩn bị cập nhật." },
        { status: 404 }
      );
    }

    // 2. Increment download count in DB
    await incrementDownloadCount(downloadLink.id);

    // 3. Read file buffer and stream as download
    const fileBuffer = fs.readFileSync(filePath);
    const fileName = path.basename(filePath);

    return new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        "Content-Disposition": `attachment; filename="${fileName}"`,
        "Content-Type": "application/octet-stream",
        "Content-Length": fileBuffer.length.toString(),
        "Cache-Control": "no-store, no-cache, must-revalidate",
      },
    });
  } catch (error) {
    console.error("Download route error:", error);
    return NextResponse.json(
      { error: "Đã có lỗi xảy ra trong quá trình tải file." },
      { status: 500 }
    );
  }
}


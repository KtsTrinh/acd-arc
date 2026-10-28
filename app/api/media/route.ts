import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createMediaItem } from "@/lib/storage";
import { isVideoUrl } from "@/lib/media-url";
import { triggerCmsAutoSync } from "@/lib/cms-auto-sync";
import { getCurrentUser } from "@/lib/auth";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const folder = searchParams.get("folder");
    const search = searchParams.get("search");

    const where: any = {};
    if (folder && folder !== "all") {
      where.folder = folder;
    }
    if (search) {
      where.OR = [
        { filename: { contains: search, mode: "insensitive" } },
        { alt: { contains: search, mode: "insensitive" } },
        { originalName: { contains: search, mode: "insensitive" } },
      ];
    }

    const mediaList = await prisma.media.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });

    // Also get distinct folders
    const folders = await prisma.media.findMany({
      select: { folder: true },
      distinct: ["folder"],
    });

    return NextResponse.json({
      media: mediaList,
      folders: folders.map((f) => f.folder).filter(Boolean),
    });
  } catch (error) {
    console.error("Error fetching media:", error);
    return NextResponse.json(
      { error: "Không thể lấy danh sách media." },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || (user.role !== "ADMIN" && user.role !== "SUPER_ADMIN")) {
      return NextResponse.json(
        { error: "Chỉ quản trị viên mới được tải media lên." },
        { status: 403 }
      );
    }

    const contentType = request.headers.get("content-type") || "";

    // 1. Case: Adding media from external URL (Pinterest, Unsplash, Mixkit, CDN...)
    if (contentType.includes("application/json")) {
      const body = await request.json();
      const { url, filename, alt, folder, mimeType } = body;

      if (!url) {
        return NextResponse.json(
          { error: "Vui lòng cung cấp URL hình ảnh." },
          { status: 400 }
        );
      }

      const detectedMime =
        mimeType ||
        (isVideoUrl(url)
          ? url.includes(".webm")
            ? "video/webm"
            : "video/mp4"
          : "image/jpeg");

      const media = await createMediaItem({
        filename: filename || url.split("/").pop()?.split("?")[0] || "media.jpg",
        originalName: filename || "External Media",
        mimeType: detectedMime,
        size: 0,
        url,
        folder: folder || "external",
        alt: alt || "ACD Media",
      });

      const sync = await triggerCmsAutoSync("thêm media mới");
      return NextResponse.json({ success: true, media, sync });
    }

    // 2. Case: Uploading physical file via FormData
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const folder = (formData.get("folder") as string) || "general";
    const alt = (formData.get("alt") as string) || "";

    if (!file) {
      return NextResponse.json(
        { error: "Không tìm thấy file để upload." },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const media = await createMediaItem({
      filename: file.name,
      originalName: file.name,
      mimeType: file.type || "image/jpeg",
      size: file.size,
      buffer,
      folder,
      alt: alt || file.name,
    });

    return NextResponse.json({ success: true, media });
  } catch (error) {
    console.error("Media upload error:", error);
    return NextResponse.json(
      { error: "Lỗi trong quá trình upload media." },
      { status: 500 }
    );
  }
}


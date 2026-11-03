import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { triggerCmsAutoSync } from "@/lib/cms-auto-sync";

export const dynamic = "force-dynamic";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    const gallery = await prisma.projectMedia.findMany({
      where: { productId: id },
      orderBy: { sortOrder: "asc" },
      include: { media: true },
    });

    return NextResponse.json({ gallery });
  } catch (error) {
    console.error("Error getting product gallery:", error);
    return NextResponse.json(
      { error: "Không thể lấy danh sách ảnh gallery sản phẩm." },
      { status: 500 }
    );
  }
}

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();
    const { mediaIds } = body;

    if (!mediaIds || !Array.isArray(mediaIds) || mediaIds.length === 0) {
      return NextResponse.json(
        { error: "Vui lòng chọn ít nhất một ảnh/video từ Media Library." },
        { status: 400 }
      );
    }

    const lastItem = await prisma.projectMedia.findFirst({
      where: { productId: id },
      orderBy: { sortOrder: "desc" },
    });
    let currentOrder = lastItem ? lastItem.sortOrder + 1 : 0;

    for (const mediaId of mediaIds) {
      // Avoid duplicate linking
      const exists = await prisma.projectMedia.findFirst({
        where: {
          productId: id,
          mediaId,
        },
      });

      if (!exists) {
        await prisma.projectMedia.create({
          data: {
            productId: id,
            mediaId,
            sortOrder: currentOrder++,
          },
        });
      }
    }

    const updatedGallery = await prisma.projectMedia.findMany({
      where: { productId: id },
      orderBy: { sortOrder: "asc" },
      include: { media: true },
    });

    const sync = await triggerCmsAutoSync("cập nhật thư viện ảnh sản phẩm");
    return NextResponse.json({ success: true, gallery: updatedGallery, sync });
  } catch (error) {
    console.error("Error adding to product gallery:", error);
    return NextResponse.json(
      { error: "Không thể thêm ảnh/video vào gallery sản phẩm." },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();
    const { items } = body;

    if (!items || !Array.isArray(items)) {
      return NextResponse.json(
        { error: "Dữ liệu sắp xếp không hợp lệ." },
        { status: 400 }
      );
    }

    await prisma.$transaction(async (prisma) => {
      for (const item of items) {
        const record = await prisma.projectMedia.findFirst({
          where: { productId: id, mediaId: item.mediaId },
        });
        if (record) {
          await prisma.projectMedia.update({
            where: { id: record.id },
            data: { sortOrder: item.sortOrder },
          });
        }
      }
    });

    const updatedGallery = await prisma.projectMedia.findMany({
      where: { productId: id },
      orderBy: { sortOrder: "asc" },
      include: { media: true },
    });

    const sync = await triggerCmsAutoSync("cập nhật thư viện ảnh sản phẩm");
    return NextResponse.json({ success: true, gallery: updatedGallery, sync });
  } catch (error) {
    console.error("Error reordering product gallery:", error);
    return NextResponse.json(
      { error: "Không thể lưu thứ tự ảnh mới." },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const { searchParams } = new URL(request.url);
    const mediaId = searchParams.get("mediaId");

    if (!mediaId) {
      return NextResponse.json(
        { error: "Vui lòng cung cấp mediaId cần xóa." },
        { status: 400 }
      );
    }

    await prisma.projectMedia.deleteMany({
      where: {
        productId: id,
        mediaId,
      },
    });

    const updatedGallery = await prisma.projectMedia.findMany({
      where: { productId: id },
      orderBy: { sortOrder: "asc" },
      include: { media: true },
    });

    const sync = await triggerCmsAutoSync("cập nhật thư viện ảnh sản phẩm");
    return NextResponse.json({ success: true, gallery: updatedGallery, sync });
  } catch (error) {
    console.error("Error removing product gallery item:", error);
    return NextResponse.json(
      { error: "Không thể xóa ảnh khỏi gallery sản phẩm." },
      { status: 500 }
    );
  }
}

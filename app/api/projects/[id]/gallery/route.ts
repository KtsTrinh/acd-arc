import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { triggerCmsAutoSync } from "@/lib/cms-auto-sync";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    const gallery = await prisma.projectMedia.findMany({
      where: { projectId: id },
      orderBy: { sortOrder: "asc" },
      include: { media: true },
    });

    return NextResponse.json({ gallery });
  } catch (error) {
    console.error("Error getting gallery:", error);
    return NextResponse.json(
      { error: "Không thể lấy danh sách ảnh gallery." },
      { status: 500 }
    );
  }
}

// Add new media items to project gallery
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
        { error: "Vui lòng chọn ít nhất một ảnh từ Media Library." },
        { status: 400 }
      );
    }

    // Get current max sortOrder
    const lastItem = await prisma.projectMedia.findFirst({
      where: { projectId: id },
      orderBy: { sortOrder: "desc" },
    });
    let currentOrder = lastItem ? lastItem.sortOrder + 1 : 0;

    for (const mediaId of mediaIds) {
      // Avoid duplicate linking
      const exists = await prisma.projectMedia.findUnique({
        where: {
          projectId_mediaId: {
            projectId: id,
            mediaId,
          },
        },
      });

      if (!exists) {
        await prisma.projectMedia.create({
          data: {
            projectId: id,
            mediaId,
            sortOrder: currentOrder++,
          },
        });
      }
    }

    const updatedGallery = await prisma.projectMedia.findMany({
      where: { projectId: id },
      orderBy: { sortOrder: "asc" },
      include: { media: true },
    });

    const sync = await triggerCmsAutoSync("cập nhật thư viện ảnh dự án");
    return NextResponse.json({ success: true, gallery: updatedGallery, sync });
  } catch (error) {
    console.error("Error adding to gallery:", error);
    return NextResponse.json(
      { error: "Không thể thêm ảnh vào gallery." },
      { status: 500 }
    );
  }
}

// Reorder gallery items from dnd-kit drag and drop
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();
    const { items } = body; // Array of { mediaId: string, sortOrder: number }

    if (!items || !Array.isArray(items)) {
      return NextResponse.json(
        { error: "Dữ liệu sắp xếp không hợp lệ." },
        { status: 400 }
      );
    }

    // Update in transaction
    await prisma.$transaction(
      items.map((item: { mediaId: string; sortOrder: number }) =>
        prisma.projectMedia.update({
          where: {
            projectId_mediaId: {
              projectId: id,
              mediaId: item.mediaId,
            },
          },
          data: {
            sortOrder: item.sortOrder,
          },
        })
      )
    );

    const updatedGallery = await prisma.projectMedia.findMany({
      where: { projectId: id },
      orderBy: { sortOrder: "asc" },
      include: { media: true },
    });

    const sync = await triggerCmsAutoSync("cập nhật thư viện ảnh dự án");
    return NextResponse.json({ success: true, gallery: updatedGallery, sync });
  } catch (error) {
    console.error("Error reordering gallery:", error);
    return NextResponse.json(
      { error: "Không thể lưu thứ tự ảnh mới." },
      { status: 500 }
    );
  }
}

// Remove an image from the project gallery
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

    await prisma.projectMedia.delete({
      where: {
        projectId_mediaId: {
          projectId: id,
          mediaId,
        },
      },
    });

    const updatedGallery = await prisma.projectMedia.findMany({
      where: { projectId: id },
      orderBy: { sortOrder: "asc" },
      include: { media: true },
    });

    const sync = await triggerCmsAutoSync("cập nhật thư viện ảnh dự án");
    return NextResponse.json({ success: true, gallery: updatedGallery, sync });
  } catch (error) {
    console.error("Error removing gallery item:", error);
    return NextResponse.json(
      { error: "Không thể xóa ảnh khỏi gallery." },
      { status: 500 }
    );
  }
}


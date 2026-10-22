import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/utils";
import { triggerCmsAutoSync } from "@/lib/cms-auto-sync";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    const project = await prisma.project.findFirst({
      where: {
        OR: [{ id }, { slug: id }],
      },
      include: {
        category: true,
        cover: true,
        tags: {
          include: {
            tag: true,
          },
        },
        gallery: {
          orderBy: { sortOrder: "asc" },
          include: {
            media: true,
          },
        },
      },
    });

    if (!project) {
      return NextResponse.json(
        { error: "Không tìm thấy dự án yêu cầu." },
        { status: 404 }
      );
    }

    return NextResponse.json({ project });
  } catch (error) {
    console.error("Error fetching project:", error);
    return NextResponse.json(
      { error: "Lỗi truy vấn dự án." },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();

    const {
      title,
      slug,
      shortDesc,
      description,
      location,
      client,
      year,
      area,
      style,
      buildingType,
      isFeatured,
      categoryId,
      coverId,
      tagIds,
    } = body;

    const updateData: any = {};
    if (title !== undefined) updateData.title = title;
    if (slug !== undefined) updateData.slug = slugify(slug);
    if (shortDesc !== undefined) updateData.shortDesc = shortDesc;
    if (description !== undefined) updateData.description = description;
    if (location !== undefined) updateData.location = location;
    if (client !== undefined) updateData.client = client;
    if (year !== undefined) updateData.year = year ? parseInt(year, 10) : null;
    if (area !== undefined) updateData.area = area ? parseFloat(area) : null;
    if (style !== undefined) updateData.style = style;
    if (buildingType !== undefined) updateData.buildingType = buildingType;
    if (isFeatured !== undefined) updateData.isFeatured = Boolean(isFeatured);
    if (categoryId !== undefined) updateData.categoryId = categoryId || null;
    if (coverId !== undefined) updateData.coverId = coverId || null;

    const updated = await prisma.project.update({
      where: { id },
      data: updateData,
    });

    // Update tags if provided
    if (tagIds && Array.isArray(tagIds)) {
      await prisma.projectTag.deleteMany({ where: { projectId: id } });
      if (tagIds.length > 0) {
        await prisma.projectTag.createMany({
          data: tagIds.map((tagId: string) => ({
            projectId: id,
            tagId,
          })),
        });
      }
    }

    const fullProject = await prisma.project.findUnique({
      where: { id },
      include: {
        category: true,
        cover: true,
        tags: { include: { tag: true } },
        gallery: { include: { media: true }, orderBy: { sortOrder: "asc" } },
      },
    });

    const sync = await triggerCmsAutoSync(
      `cập nhật dự án "${fullProject?.title ?? ""}"`
    );
    return NextResponse.json({ success: true, project: fullProject, sync });
  } catch (error) {
    console.error("Error updating project:", error);
    return NextResponse.json(
      { error: "Không thể cập nhật dự án." },
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
    await prisma.project.delete({ where: { id } });
    const sync = await triggerCmsAutoSync("xóa dự án");
    return NextResponse.json({
      success: true,
      message: "Đã xóa dự án thành công.",
      sync,
    });
  } catch (error) {
    console.error("Error deleting project:", error);
    return NextResponse.json(
      { error: "Không thể xóa dự án." },
      { status: 500 }
    );
  }
}


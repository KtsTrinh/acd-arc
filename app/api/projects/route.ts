import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/utils";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const style = searchParams.get("style");
    const year = searchParams.get("year");
    const search = searchParams.get("search");
    const featured = searchParams.get("featured");

    const where: any = {};

    if (category) {
      where.category = {
        slug: category,
      };
    }

    if (style) {
      where.style = {
        contains: style,
        mode: "insensitive",
      };
    }

    if (year) {
      where.year = parseInt(year, 10);
    }

    if (featured === "true") {
      where.isFeatured = true;
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { location: { contains: search, mode: "insensitive" } },
        { shortDesc: { contains: search, mode: "insensitive" } },
        { buildingType: { contains: search, mode: "insensitive" } },
      ];
    }

    const projects = await prisma.project.findMany({
      where,
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
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ projects });
  } catch (error) {
    console.error("Error fetching projects:", error);
    return NextResponse.json(
      { error: "Không thể lấy danh sách dự án." },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
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
      galleryMediaIds,
    } = body;

    if (!title) {
      return NextResponse.json(
        { error: "Vui lòng nhập tên dự án." },
        { status: 400 }
      );
    }

    const finalSlug = slug ? slugify(slug) : slugify(title);

    // Verify slug uniqueness
    const existing = await prisma.project.findUnique({
      where: { slug: finalSlug },
    });
    if (existing) {
      return NextResponse.json(
        { error: "Đường dẫn slug này đã tồn tại, vui lòng chọn đường dẫn khác." },
        { status: 400 }
      );
    }

    const project = await prisma.project.create({
      data: {
        title,
        slug: finalSlug,
        shortDesc,
        description,
        location,
        client,
        year: year ? parseInt(year, 10) : undefined,
        area: area ? parseFloat(area) : undefined,
        style,
        buildingType,
        isFeatured: Boolean(isFeatured),
        categoryId: categoryId || undefined,
        coverId: coverId || undefined,
      },
    });

    // Attach tags if provided
    if (tagIds && Array.isArray(tagIds) && tagIds.length > 0) {
      await prisma.projectTag.createMany({
        data: tagIds.map((tagId: string) => ({
          projectId: project.id,
          tagId,
        })),
      });
    }

    // Attach initial gallery media if provided
    if (galleryMediaIds && Array.isArray(galleryMediaIds) && galleryMediaIds.length > 0) {
      await prisma.projectMedia.createMany({
        data: galleryMediaIds.map((mediaId: string, index: number) => ({
          projectId: project.id,
          mediaId,
          sortOrder: index,
        })),
      });
    }

    const createdProject = await prisma.project.findUnique({
      where: { id: project.id },
      include: {
        category: true,
        cover: true,
        tags: { include: { tag: true } },
        gallery: { include: { media: true }, orderBy: { sortOrder: "asc" } },
      },
    });

    return NextResponse.json({ success: true, project: createdProject });
  } catch (error) {
    console.error("Error creating project:", error);
    return NextResponse.json(
      { error: "Lỗi trong quá trình tạo dự án." },
      { status: 500 }
    );
  }
}


import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/utils";
import { triggerCmsAutoSync } from "@/lib/cms-auto-sync";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  try {
    const categories = await prisma.projectCategory.findMany({
      include: {
        _count: {
          select: { projects: true },
        },
      },
      orderBy: { name: "asc" },
    });
    return NextResponse.json({ categories });
  } catch (error) {
    console.error("Error fetching categories:", error);
    return NextResponse.json(
      { error: "Không thể lấy danh mục dự án." },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || !(user.role === "ADMIN" || user.role === "SUPER_ADMIN")) {
      return NextResponse.json(
        { error: "Chỉ quản trị viên mới được tạo danh mục." },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { name, slug, description, image } = body;

    if (!name) {
      return NextResponse.json(
        { error: "Vui lòng nhập tên danh mục." },
        { status: 400 }
      );
    }

    const finalSlug = slug ? slugify(slug) : slugify(name);

    const category = await prisma.projectCategory.create({
      data: {
        name,
        slug: finalSlug,
        description,
        image,
      },
    });

    const sync = await triggerCmsAutoSync(`thêm danh mục "${category.name}"`);
    return NextResponse.json({ success: true, category, sync });
  } catch (error) {
    console.error("Error creating category:", error);
    return NextResponse.json(
      { error: "Lỗi trong quá trình tạo danh mục." },
      { status: 500 }
    );
  }
}


import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/utils";
import { triggerCmsAutoSync } from "@/lib/cms-auto-sync";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  try {
    const tags = await prisma.tag.findMany({
      include: {
        _count: {
          select: { projects: true, posts: true },
        },
      },
      orderBy: { name: "asc" },
    });
    return NextResponse.json({ tags });
  } catch (error) {
    console.error("Error fetching tags:", error);
    return NextResponse.json(
      { error: "Không thể lấy danh sách thẻ tag." },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const { name } = await request.json();
    if (!name) {
      return NextResponse.json({ error: "Vui lòng nhập tên tag" }, { status: 400 });
export async function DELETE(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || (user.role !== "ADMIN" && (user.role as string) !== "SUPER_ADMIN")) {
      return NextResponse.json({ error: "Không có quyền xóa thẻ tag." }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json({ error: "Thiếu ID thẻ tag." }, { status: 400 });
    }

    await prisma.tag.delete({ where: { id } });

    const sync = await triggerCmsAutoSync("xóa thẻ tag");
    return NextResponse.json({ success: true, sync });
  } catch (error) {
    console.error("Error deleting tag:", error);
    return NextResponse.json(
      { error: "Không thể xóa thẻ tag (tag còn đang được sử dụng?)." },
      { status: 500 }
    );
  }
}

    const slug = slugify(name);
    const tag = await prisma.tag.create({
      data: { name, slug },
    });

    const sync = await triggerCmsAutoSync(`thêm tag "${tag.name}"`);
    return NextResponse.json({ success: true, tag, sync });
  } catch (error) {
    console.error("Error creating tag:", error);
    return NextResponse.json({ error: "Không thể tạo thẻ tag" }, { status: 500 });
  }
}


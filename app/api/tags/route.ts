import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/utils";

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
    }

    const slug = slugify(name);
    const tag = await prisma.tag.create({
      data: { name, slug },
    });

    return NextResponse.json({ success: true, tag });
  } catch (error) {
    console.error("Error creating tag:", error);
    return NextResponse.json({ error: "Không thể tạo thẻ tag" }, { status: 500 });
  }
}


import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/utils";
import { getCurrentUser } from "@/lib/auth";
import { triggerCmsAutoSync } from "@/lib/cms-auto-sync";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search");

    const where: any = { published: true };
    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { excerpt: { contains: search, mode: "insensitive" } },
      ];
    }

    const posts = await prisma.post.findMany({
      where,
      include: {
        author: {
          select: { name: true, avatar: true },
        },
        tags: {
          include: { tag: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ posts });
  } catch (error) {
    console.error("Error fetching posts:", error);
    return NextResponse.json({ error: "Không thể lấy bài viết." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    const body = await request.json();
    const { title, slug, excerpt, content, coverUrl, tagIds } = body;

    if (!title || !content) {
      return NextResponse.json(
        { error: "Vui lòng nhập tiêu đề và nội dung bài viết." },
        { status: 400 }
      );
    }

    const finalSlug = slug ? slugify(slug) : slugify(title);

    const post = await prisma.post.create({
      data: {
        title,
        slug: finalSlug,
        excerpt,
        content,
        coverUrl,
        authorId: user?.id || null,
      },
    });

    if (tagIds && Array.isArray(tagIds) && tagIds.length > 0) {
      await prisma.postTag.createMany({
        data: tagIds.map((tagId: string) => ({
          postId: post.id,
          tagId,
        })),
      });
    }

    const sync = await triggerCmsAutoSync(`thêm bài viết "${post.title}"`);
    return NextResponse.json({ success: true, post, sync });
  } catch (error) {
    console.error("Error creating post:", error);
    return NextResponse.json({ error: "Lỗi tạo bài viết." }, { status: 500 });
  }
}


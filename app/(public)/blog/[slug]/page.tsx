import React from "react";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatDateTime } from "@/lib/utils";
import { Calendar, User, ArrowLeft, Tag, Eye } from "lucide-react";

export const revalidate = 0;

export default async function BlogPostDetailPage({
  params,
}: {
  params: { slug: string };
}) {
  const post = await prisma.post.findFirst({
    where: {
      OR: [{ slug: params.slug }, { id: params.slug }],
    },
    include: {
      author: true,
      tags: { include: { tag: true } },
    },
  });

  if (!post) {
    notFound();
  }

  // Increment views
  await prisma.post.update({
    where: { id: post.id },
    data: { views: { increment: 1 } },
  });

  return (
    <div className="pt-28 pb-24 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
      <Link
        href="/blog"
        className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-thuy-400 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Quay lại tạp chí kiến trúc</span>
      </Link>

      <div className="space-y-4">
        <h1 className="font-display font-extrabold text-3xl sm:text-5xl text-white leading-tight">
          {post.title}
        </h1>

        <div className="flex flex-wrap items-center gap-6 text-xs text-slate-400 border-b border-thuy-800 pb-4">
          <span className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-thuy-400" />
            {formatDateTime(post.createdAt)}
          </span>
          <span className="flex items-center gap-1.5">
            <User className="w-3.5 h-3.5 text-thuy-400" />
            Tác giả: {post.author?.name || "ACD Studio"}
          </span>
          <span className="flex items-center gap-1.5">
            <Eye className="w-3.5 h-3.5 text-thuy-400" />
            {post.views + 1} lượt đọc
          </span>
        </div>
      </div>

      {post.coverUrl && (
        <div className="relative aspect-[16/9] rounded-3xl overflow-hidden border border-thuy-750 bg-thuy-950 shadow-2xl">
          <Image
            src={post.coverUrl}
            alt={post.title}
            fill
            className="object-cover"
            priority
            unoptimized
          />
        </div>
      )}

      {/* Post body */}
      <div className="prose prose-invert prose-cyan max-w-none text-sm text-slate-300 leading-relaxed space-y-4">
        <div
          dangerouslySetInnerHTML={{
            __html: post.content.replace(/\n\n/g, "<br/><br/>"),
          }}
        />
      </div>

      {/* Tags */}
      {post.tags.length > 0 && (
        <div className="pt-8 border-t border-thuy-800 flex items-center gap-2">
          <Tag className="w-4 h-4 text-thuy-400" />
          <div className="flex flex-wrap gap-2">
            {post.tags.map((t) => (
              <span
                key={t.tag.id}
                className="px-3 py-1 rounded-lg bg-thuy-800 text-slate-300 text-xs border border-thuy-700"
              >
                #{t.tag.name}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}


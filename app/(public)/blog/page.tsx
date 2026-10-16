import React from "react";
import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import { formatDateTime } from "@/lib/utils";
import { Calendar, User, ArrowRight, Eye, Sparkles } from "lucide-react";

export const revalidate = 0;

export default async function BlogPage() {
  const posts = await prisma.post.findMany({
    where: { published: true },
    include: {
      author: true,
      tags: { include: { tag: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="pt-28 pb-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
      <div className="space-y-3">
        <span className="text-xs text-thuy-400 uppercase tracking-widest font-semibold block">
          Tạp Chí & Nghiên Cứu
        </span>
        <h1 className="font-display font-bold text-3xl sm:text-5xl text-white">
          Kiến Trúc, Phong Thủy Mệnh Thủy & Không Gian Sống
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 max-w-2xl font-light">
          Góc chia sẻ kinh nghiệm thiết kế, phân tích triết lý phong thủy ngũ hành và cập nhật xu hướng
          kiến trúc biệt thự nghỉ dưỡng đương đại.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {posts.map((post) => (
          <Link
            key={post.id}
            href={`/blog/${post.slug}`}
            className="group flex flex-col rounded-2xl overflow-hidden bg-thuy-850/60 border border-thuy-750 hover:border-thuy-400 transition-all duration-300 hover:shadow-card-dark"
          >
            <div className="relative aspect-[16/10] overflow-hidden bg-thuy-950">
              {post.coverUrl ? (
                <Image
                  src={post.coverUrl}
                  alt={post.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                  unoptimized
                />
              ) : (
                <div className="w-full h-full bg-thuy-900" />
              )}
            </div>

            <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
              <div className="space-y-2">
                <div className="flex items-center gap-3 text-[11px] text-slate-400">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-thuy-400" />
                    {formatDateTime(post.createdAt)}
                  </span>
                  <span className="flex items-center gap-1">
                    <Eye className="w-3.5 h-3.5 text-thuy-400" />
                    {post.views} lượt xem
                  </span>
                </div>

                <h2 className="font-display font-bold text-lg text-white group-hover:text-thuy-300 transition-colors line-clamp-2">
                  {post.title}
                </h2>

                <p className="text-xs text-slate-400 line-clamp-3 leading-relaxed">
                  {post.excerpt}
                </p>
              </div>

              <div className="pt-4 border-t border-thuy-800 flex items-center justify-between text-xs text-thuy-400 font-semibold">
                <span>Đọc toàn bộ bài viết</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}


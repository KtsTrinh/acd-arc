import React from "react";
import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import { formatDateTime } from "@/lib/utils";
import { Calendar, ArrowRight, Eye, Tag as TagIcon, Search, Sparkles } from "lucide-react";

export const revalidate = 0;

interface BlogPageProps {
  searchParams?: {
    tag?: string;
    search?: string;
  };
}

const filterCategories = [
  { label: "Tất Cả", slug: "all" },
  { label: "Nhà Phố", slug: "nha-pho" },
  { label: "Nội Thất", slug: "noi-that" },
  { label: "Nhà Vườn", slug: "nha-vuon" },
  { label: "Mặt Tiền Hướng Tây", slug: "mat-tien-huong-tay" },
  { label: "Giếng Trời Lấy Sáng", slug: "gieng-troi-lay-sang" },
  { label: "Hà Nội", slug: "ha-noi" },
  { label: "Bắc Ninh", slug: "bac-ninh" },
  { label: "Quảng Ninh", slug: "quang-ninh" },
  { label: "Phong Thủy Hợp Mệnh", slug: "phong-thuy-hop-menh" },
];

export default async function BlogPage({ searchParams }: BlogPageProps) {
  const currentTag = searchParams?.tag || "all";
  const searchQuery = searchParams?.search || "";

  const where: any = { published: true };

  if (currentTag && currentTag !== "all") {
    where.tags = {
      some: {
        tag: {
          slug: currentTag,
        },
      },
    };
  }

  if (searchQuery) {
    where.OR = [
      { title: { contains: searchQuery, mode: "insensitive" } },
      { excerpt: { contains: searchQuery, mode: "insensitive" } },
      { content: { contains: searchQuery, mode: "insensitive" } },
    ];
  }

  const posts = await prisma.post.findMany({
    where,
    include: {
      author: true,
      tags: { include: { tag: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="pt-28 pb-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
      {/* Header */}
      <div className="space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-thuy-500/10 border border-thuy-500/20 text-thuy-400 text-xs font-semibold uppercase tracking-widest">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Tạp Chí Kiến Trúc & Nghiên Cứu Chuyên Sâu</span>
        </div>
        <h1 className="font-display font-bold text-3xl sm:text-5xl text-white tracking-tight">
          Kiến Trúc, Phong Thủy Hợp Mệnh Ngũ Hành & Không Gian Sống
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 max-w-3xl font-light leading-relaxed">
          Tổng hợp hơn 70 bài viết chuyên sâu về các dự án thực tế: giải pháp nhà phố chống nóng mặt tiền hướng Tây,
          giếng trời lấy sáng và đối lưu gió tự nhiên, nội thất cao cấp và biệt thự nhà vườn tại Hà Nội, Bắc Ninh, Quảng Ninh.
        </p>
      </div>

      {/* Filter Tabs & Search */}
      <div className="space-y-4">
        {/* Search Bar */}
        <form method="GET" action="/blog" className="flex items-center max-w-md">
          <div className="relative w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              name="search"
              defaultValue={searchQuery}
              placeholder="Tìm kiếm bài viết, dự án, phong cách..."
              className="w-full pl-10 pr-4 py-2 text-xs rounded-xl bg-thuy-900/80 border border-thuy-750 text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-thuy-400"
            />
            {currentTag !== "all" && <input type="hidden" name="tag" value={currentTag} />}
          </div>
        </form>

        {/* Filter Chips */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none text-xs">
          {filterCategories.map((cat) => {
            const isActive = currentTag === cat.slug;
            const targetUrl =
              cat.slug === "all"
                ? searchQuery
                  ? `/blog?search=${encodeURIComponent(searchQuery)}`
                  : "/blog"
                : searchQuery
                ? `/blog?tag=${cat.slug}&search=${encodeURIComponent(searchQuery)}`
                : `/blog?tag=${cat.slug}`;

            return (
              <Link
                key={cat.slug}
                href={targetUrl}
                className={`px-3.5 py-1.5 rounded-full whitespace-nowrap transition-all duration-200 font-medium ${
                  isActive
                    ? "bg-thuy-500 text-thuy-950 font-bold shadow-md shadow-thuy-500/20"
                    : "bg-thuy-850/70 text-slate-400 border border-thuy-750 hover:border-thuy-500/50 hover:text-white"
                }`}
              >
                {cat.label}
              </Link>
            );
          })}
        </div>
      </div>

      {/* Posts Count */}
      <div className="flex items-center justify-between text-xs text-slate-400 border-b border-thuy-800 pb-3">
        <span>Hiển thị <strong className="text-white">{posts.length}</strong> bài viết</span>
        {currentTag !== "all" && (
          <Link href="/blog" className="text-thuy-400 hover:underline">
            Xóa bộ lọc
          </Link>
        )}
      </div>

      {/* Posts Grid */}
      {posts.length === 0 ? (
        <div className="text-center py-20 bg-thuy-850/40 rounded-3xl border border-thuy-750 p-8 space-y-3">
          <p className="text-slate-300 font-medium">Không tìm thấy bài viết nào phù hợp.</p>
          <Link href="/blog" className="inline-block text-xs text-thuy-400 underline">
            Xem toàn bộ bài viết
          </Link>
        </div>
      ) : (
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

                {/* Badge primary tag */}
                {post.tags?.[0] && (
                  <div className="absolute top-3 left-3 px-2.5 py-1 rounded-md bg-thuy-950/80 backdrop-blur-md text-[10px] font-semibold text-thuy-300 border border-thuy-700/50">
                    {post.tags[0].tag.name}
                  </div>
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

                {/* Tags preview */}
                {post.tags && post.tags.length > 1 && (
                  <div className="flex flex-wrap gap-1.5 pt-2">
                    {post.tags.slice(1, 4).map((t) => (
                      <span
                        key={t.tag.id}
                        className="px-2 py-0.5 rounded text-[10px] bg-thuy-900/90 text-slate-400 border border-thuy-800"
                      >
                        #{t.tag.name}
                      </span>
                    ))}
                  </div>
                )}

                <div className="pt-4 border-t border-thuy-800 flex items-center justify-between text-xs text-thuy-400 font-semibold">
                  <span>Đọc toàn bộ bài viết</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

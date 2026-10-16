import React from "react";
import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import { formatVND } from "@/lib/utils";
import {
  Compass,
  ArrowRight,
  Sparkles,
  Layers,
  Download,
  Calendar,
  MapPin,
  Maximize2,
  CheckCircle2,
  Eye,
  ShieldCheck,
  ChevronRight,
} from "lucide-react";
import FengShuiDestinyExplorer from "@/components/home/FengShuiDestinyExplorer";

export const revalidate = 0; // Dynamic server rendering

export default async function HomePage() {
  // Fetch real data from PostgreSQL via Prisma
  const [categories, featuredProjects, latestProjects, featuredProducts, latestPosts] =
    await Promise.all([
      prisma.projectCategory.findMany({
        include: { _count: { select: { projects: true } } },
        orderBy: { name: "asc" },
      }),
      prisma.project.findMany({
        where: { isFeatured: true },
        include: {
          category: true,
          cover: true,
          tags: { include: { tag: true } },
        },
        take: 3,
        orderBy: { createdAt: "desc" },
      }),
      prisma.project.findMany({
        include: {
          category: true,
          cover: true,
          tags: { include: { tag: true } },
        },
        take: 6,
        orderBy: { createdAt: "desc" },
      }),
      prisma.product.findMany({
        where: { active: true },
        take: 4,
        orderBy: { createdAt: "desc" },
      }),
      prisma.post.findMany({
        where: { published: true },
        take: 3,
        orderBy: { createdAt: "desc" },
      }),
    ]);

  return (
    <div className="space-y-24 pb-20 overflow-hidden">
      {/* 1. HERO SECTION: Massive Image + Feng Shui Water Aesthetics */}
      <section className="relative min-h-[92vh] flex flex-col justify-end pt-28 pb-16 px-4 sm:px-6 lg:px-8 overflow-hidden">
        {/* Background Hero Image */}
        <div className="absolute inset-0 z-0">
          <Image
            src="https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1920&q=85"
            alt="ACD Luxury Villa Water Architecture"
            fill
            className="object-cover object-center scale-105 animate-pulse duration-[10000ms]"
            priority
            unoptimized
          />
          {/* Mệnh Thủy Gradient Overlays */}
          <div className="absolute inset-0 bg-gradient-to-t from-thuy-950 via-thuy-950/75 to-thuy-950/40" />
          <div className="absolute inset-0 bg-radial-gradient opacity-90" />
        </div>

        {/* Hero Content */}
        <div className="relative z-10 max-w-7xl mx-auto w-full space-y-8">
          <div className="max-w-3xl space-y-4">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-thuy-800/80 border border-thuy-400/40 text-thuy-300 text-xs tracking-wider uppercase backdrop-blur-md">
              <Sparkles className="w-3.5 h-3.5 text-thuy-400 animate-spin" />
              <span>Kiến Trúc & Nội Thất Thượng Lưu • Phong Thủy Hợp Mệnh Ngũ Hành</span>
            </div>

            <h1 className="font-display font-extrabold text-4xl sm:text-6xl lg:text-7xl tracking-tight text-white leading-[1.08]">
              Khắc Họa <br />
              <span className="bg-gradient-to-r from-thuy-200 via-thuy-400 to-aqua-400 bg-clip-text text-transparent text-glow">
                Không Gian Hợp Mệnh
              </span>
            </h1>

            <p className="text-slate-300 text-sm sm:text-base leading-relaxed max-w-2xl font-light">
              ACD Studio kiến tạo các công trình biệt thự, nhà phố và penthouse độc bản. Nghiên cứu sâu
              sắc triết lý phong thủy ngũ hành hợp mệnh (Kim - Mộc - Thủy - Hỏa - Thổ) kết hợp giải pháp
              số hóa hồ sơ CAD & 3D chuyên nghiệp.
            </p>

            <div className="flex flex-wrap gap-4 pt-2">
              <Link
                href="/projects"
                className="px-7 py-3.5 rounded-xl font-bold text-xs uppercase tracking-wider text-thuy-950 bg-gradient-to-r from-thuy-400 to-aqua-400 hover:brightness-110 shadow-glow-cyan transition-all flex items-center gap-2"
              >
                <span>Khám Phá Dự Án</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/products"
                className="px-7 py-3.5 rounded-xl font-bold text-xs uppercase tracking-wider text-white bg-thuy-850/80 hover:bg-thuy-800 border border-thuy-700/80 backdrop-blur-sm transition-all flex items-center gap-2"
              >
                <span>Kho Tài Nguyên CAD & 3D</span>
              </Link>
            </div>
          </div>

          {/* 2. CATEGORY QUICK ACCESS CARDS (DIRECTLY BELOW HERO) */}
          <div className="pt-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-semibold uppercase tracking-wider text-thuy-300">
                Lựa chọn hạng mục kiến trúc:
              </span>
              <span className="text-xs text-slate-400">5 phân hệ độc bản</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
              {categories.map((cat) => (
                <Link
                  key={cat.id}
                  href={`/projects?category=${cat.slug}`}
                  className="group relative h-36 rounded-2xl overflow-hidden border border-thuy-700/70 hover:border-thuy-400 transition-all duration-300 hover:shadow-glow-cyan bg-thuy-950"
                >
                  {cat.image ? (
                    <Image
                      src={cat.image}
                      alt={cat.name}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-700"
                      unoptimized
                    />
                  ) : (
                    <div className="w-full h-full bg-thuy-900" />
                  )}

                  {/* Dark gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-thuy-950 via-thuy-950/70 to-transparent p-3.5 flex flex-col justify-end">
                    <span className="text-[10px] text-thuy-400 font-semibold uppercase">
                      {cat._count.projects} Dự án
                    </span>
                    <h3 className="font-semibold text-xs text-white group-hover:text-thuy-300 transition-colors line-clamp-2">
                      {cat.name}
                    </h3>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 3. FEATURED PROJECTS (KIỆT TÁC TIÊU BIỂU) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-thuy-800 pb-6">
          <div>
            <span className="text-xs text-thuy-400 uppercase tracking-widest font-semibold block mb-1">
              Tuyển Tập Độc Bản
            </span>
            <h2 className="font-display font-bold text-3xl sm:text-4xl text-white">
              Dự Án Kiến Trúc Nổi Bật
            </h2>
          </div>
          <Link
            href="/projects"
            className="inline-flex items-center gap-1.5 text-xs uppercase tracking-wider font-semibold text-thuy-400 hover:text-white transition-colors"
          >
            <span>Xem tất cả dự án</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {featuredProjects.map((project) => (
            <Link
              key={project.id}
              href={`/projects/${project.slug}`}
              className="group flex flex-col rounded-2xl overflow-hidden bg-thuy-850/60 border border-thuy-750/80 hover:border-thuy-400 transition-all duration-300 hover:shadow-card-dark"
            >
              <div className="relative aspect-[16/10] overflow-hidden bg-thuy-950">
                {project.cover ? (
                  <Image
                    src={project.cover.url}
                    alt={project.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-700"
                    unoptimized
                  />
                ) : (
                  <div className="w-full h-full bg-thuy-900 flex items-center justify-center text-slate-500">
                    ACD Architecture
                  </div>
                )}
                <div className="absolute top-3 left-3 px-3 py-1 rounded-full bg-thuy-950/80 backdrop-blur-md border border-thuy-700 text-[11px] font-medium text-thuy-300">
                  {project.category?.name || "Kiến trúc"}
                </div>
                {project.area && (
                  <div className="absolute bottom-3 right-3 px-2.5 py-1 rounded-md bg-thuy-950/90 text-[11px] text-white font-medium border border-thuy-700">
                    {project.area} m²
                  </div>
                )}
              </div>

              <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-3 text-xs text-slate-400">
                    {project.location && (
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-thuy-400" />
                        {project.location}
                      </span>
                    )}
                    {project.year && (
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-thuy-400" />
                        {project.year}
                      </span>
                    )}
                  </div>
                  <h3 className="font-display font-bold text-xl text-white group-hover:text-thuy-300 transition-colors">
                    {project.title}
                  </h3>
                  <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                    {project.shortDesc}
                  </p>
                </div>

                <div className="pt-4 border-t border-thuy-800 flex items-center justify-between text-xs">
                  <span className="text-thuy-400 font-semibold group-hover:translate-x-1 transition-transform inline-flex items-center gap-1">
                    Chi tiết công trình <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                  <span className="text-slate-500">{project.style}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* 4. DIGITAL RESOURCES / E-COMMERCE SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <div className="rounded-3xl bg-gradient-to-b from-thuy-850 to-thuy-950 border border-thuy-700/80 p-8 sm:p-12 relative overflow-hidden">
          {/* Subtle water glow badge */}
          <div className="absolute -top-24 -right-24 w-80 h-80 rounded-full bg-thuy-400/10 blur-3xl pointer-events-none" />

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-thuy-750 pb-8 mb-8">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-thuy-800 text-thuy-300 text-xs border border-thuy-700">
                <Layers className="w-3.5 h-3.5 text-thuy-400" />
                <span>Thương Mại & Số Hóa Kiến Trúc</span>
              </div>
              <h2 className="font-display font-bold text-3xl sm:text-4xl text-white">
                Kho Hồ Sơ CAD & Model 3D Độc Quyền
              </h2>
              <p className="text-xs sm:text-sm text-slate-400 max-w-xl">
                Bản quyền file chuẩn chỉnh từ ACD Studio. Tải ngay lập tức sau thanh toán với liên kết bảo
                mật có thời hạn.
              </p>
            </div>

            <Link
              href="/products"
              className="px-5 py-2.5 rounded-xl bg-thuy-800 hover:bg-thuy-750 border border-thuy-700 text-thuy-300 hover:text-white text-xs font-semibold transition-all inline-flex items-center gap-2"
            >
              <span>Xem Toàn Bộ Sản Phẩm</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredProducts.map((prod) => (
              <div
                key={prod.id}
                className="group flex flex-col justify-between rounded-2xl bg-thuy-900 border border-thuy-750 p-4 hover:border-thuy-400 transition-all duration-300 hover:shadow-card-dark"
              >
                <div className="space-y-3">
                  <div className="relative aspect-[4/3] rounded-xl overflow-hidden bg-thuy-950">
                    {prod.thumbnail ? (
                      <Image
                        src={prod.thumbnail}
                        alt={prod.name}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                        unoptimized
                      />
                    ) : (
                      <div className="w-full h-full bg-thuy-800 flex items-center justify-center text-slate-500">
                        <Download className="w-6 h-6" />
                      </div>
                    )}
                    <span className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded bg-thuy-950/80 backdrop-blur-sm border border-thuy-700 text-[10px] font-bold text-thuy-300">
                      {prod.type}
                    </span>
                  </div>

                  <div>
                    <h3 className="font-semibold text-sm text-white line-clamp-2 leading-snug group-hover:text-thuy-300 transition-colors">
                      {prod.name}
                    </h3>
                    <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">
                      {prod.fileFormat || prod.description}
                    </p>
                  </div>
                </div>

                <div className="pt-4 mt-4 border-t border-thuy-800 flex items-center justify-between">
                  <div>
                    <span className="font-bold text-sm text-thuy-400">
                      {formatVND(prod.price)}
                    </span>
                    {prod.comparePrice && (
                      <span className="text-[10px] text-slate-500 line-through block">
                        {formatVND(prod.comparePrice)}
                      </span>
                    )}
                  </div>

                  <Link
                    href={`/products/${prod.slug}`}
                    className="p-2 rounded-lg bg-thuy-800 hover:bg-thuy-400 hover:text-thuy-950 text-slate-300 transition-colors"
                    title="Xem chi tiết"
                  >
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. FENG SHUI DESTINY EXPLORER (NGŨ HÀNH KIM - MỘC - THỦY - HỎA - THỔ) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <FengShuiDestinyExplorer />
      </section>

      {/* 6. LATEST ARCHITECTURAL BLOG */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <div className="flex items-center justify-between border-b border-thuy-800 pb-6">
          <div>
            <span className="text-xs text-thuy-400 uppercase tracking-widest font-semibold block mb-1">
              Góc Chuyên Gia
            </span>
            <h2 className="font-display font-bold text-3xl sm:text-4xl text-white">
              Tạp Chí Kiến Trúc & Xu Hướng
            </h2>
          </div>
          <Link
            href="/blog"
            className="inline-flex items-center gap-1.5 text-xs uppercase tracking-wider font-semibold text-thuy-400 hover:text-white transition-colors"
          >
            <span>Tất cả bài viết</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {latestPosts.map((post) => (
            <Link
              key={post.id}
              href={`/blog/${post.slug}`}
              className="group flex flex-col rounded-2xl overflow-hidden bg-thuy-850/60 border border-thuy-750 hover:border-thuy-400 transition-all duration-300"
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
              <div className="p-6 flex-1 flex flex-col justify-between space-y-3">
                <div>
                  <span className="text-[11px] text-thuy-400 font-semibold uppercase tracking-wider">
                    Bài viết chuyên sâu
                  </span>
                  <h3 className="font-display font-bold text-lg text-white group-hover:text-thuy-300 transition-colors mt-1 line-clamp-2">
                    {post.title}
                  </h3>
                  <p className="text-xs text-slate-400 mt-2 line-clamp-3 leading-relaxed">
                    {post.excerpt}
                  </p>
                </div>
                <div className="pt-4 border-t border-thuy-800 flex items-center justify-between text-xs text-slate-500">
                  <span>Đọc tiếp</span>
                  <ChevronRight className="w-4 h-4 text-thuy-400" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}


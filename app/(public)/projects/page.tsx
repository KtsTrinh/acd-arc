import React from "react";
import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import { Search, MapPin, Calendar, ArrowRight, SlidersHorizontal, Sparkles } from "lucide-react";

export const revalidate = 0;

interface ProjectsPageProps {
  searchParams: {
    category?: string;
    style?: string;
    year?: string;
    search?: string;
    menh?: string;
  };
}

export default async function ProjectsPage({ searchParams }: ProjectsPageProps) {
  const { category, style, year, search, menh } = searchParams;

  const where: any = {};
  if (category && category !== "all") {
    where.category = { slug: category };
  }
  if (style && style !== "all") {
    where.style = { contains: style, mode: "insensitive" };
  }
  if (year && year !== "all") {
    where.year = parseInt(year, 10);
  }
  if (menh && menh !== "all") {
    where.tags = {
      some: {
        tag: {
          slug: menh,
        },
      },
    };
  }
  if (search) {
    where.OR = [
      { title: { contains: search, mode: "insensitive" } },
      { location: { contains: search, mode: "insensitive" } },
      { shortDesc: { contains: search, mode: "insensitive" } },
      { buildingType: { contains: search, mode: "insensitive" } },
      { style: { contains: search, mode: "insensitive" } },
      { client: { contains: search, mode: "insensitive" } },
    ];
  }

  const [projects, categories] = await Promise.all([
    prisma.project.findMany({
      where,
      include: {
        category: true,
        cover: true,
        tags: { include: { tag: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.projectCategory.findMany({
      include: { _count: { select: { projects: true } } },
      orderBy: { name: "asc" },
    }),
  ]);

  const menhOptions = [
    { label: "Mệnh Kim", value: "menh-kim" },
    { label: "Mệnh Mộc", value: "menh-moc" },
    { label: "Mệnh Thủy", value: "menh-thuy" },
    { label: "Mệnh Hỏa", value: "menh-hoa" },
    { label: "Mệnh Thổ", value: "menh-tho" },
  ];

  return (
    <div className="pt-28 pb-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
      {/* Page Title & Breadcrumbs */}
      <div className="space-y-3">
        <span className="text-xs text-thuy-400 uppercase tracking-widest font-semibold block">
          Portfolio Kiến Trúc
        </span>
        <h1 className="font-display font-bold text-3xl sm:text-5xl text-white">
          Dự Án Kiến Trúc & Nội Thất
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 max-w-2xl font-light">
          Khám phá các công trình biệt thự, nhà phố, penthouse và resort cao cấp mang phong cách đương
          đại kết hợp nguyên lý phong thủy ngũ hành hợp mệnh (Kim - Mộc - Thủy - Hỏa - Thổ).
        </p>
      </div>

      {/* Filter & Search Bar */}
      <div className="p-4 rounded-2xl bg-thuy-850/80 border border-thuy-750 backdrop-blur-md space-y-4">
        <form method="GET" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Search Keyword */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              name="search"
              defaultValue={search || ""}
              placeholder="Tìm theo tên, địa điểm..."
              className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-thuy-900 border border-thuy-700 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-thuy-400"
            />
          </div>

          {/* Phong Thủy Hợp Mệnh Select */}
          <div>
            <select
              name="menh"
              defaultValue={menh || "all"}
              className="w-full px-3 py-2.5 rounded-xl bg-thuy-900 border border-thuy-700 text-xs text-white focus:outline-none focus:border-thuy-400 cursor-pointer"
            >
              <option value="all">Tất cả bản mệnh (Ngũ Hành)</option>
              {menhOptions.map((m) => (
                <option key={m.value} value={m.value}>
                  {m.label}
                </option>
              ))}
            </select>
          </div>

          {/* Category Select */}
          <div>
            <select
              name="category"
              defaultValue={category || "all"}
              className="w-full px-3 py-2.5 rounded-xl bg-thuy-900 border border-thuy-700 text-xs text-white focus:outline-none focus:border-thuy-400 cursor-pointer"
            >
              <option value="all">Tất cả danh mục ({categories.reduce((acc, c) => acc + c._count.projects, 0)})</option>
              {categories.map((c) => (
                <option key={c.id} value={c.slug}>
                  {c.name} ({c._count.projects})
                </option>
              ))}
            </select>
          </div>

          {/* Style Filter */}
          <div>
            <select
              name="style"
              defaultValue={style || "all"}
              className="w-full px-3 py-2.5 rounded-xl bg-thuy-900 border border-thuy-700 text-xs text-white focus:outline-none focus:border-thuy-400 cursor-pointer"
            >
              <option value="all">Tất cả phong cách</option>
              <option value="Modern">Modern / Hiện Đại</option>
              <option value="Minimalist">Minimalist / Tối Giản</option>
              <option value="Tropical">Tropical Modern</option>
              <option value="Dark">Dark Minimalist</option>
              <option value="Earth">Earth Architecture</option>
              <option value="Contemporary">Contemporary</option>
            </select>
          </div>

          {/* Submit Filter Button */}
          <div className="flex gap-2">
            <button
              type="submit"
              className="flex-1 py-2.5 rounded-xl bg-thuy-400 text-thuy-950 font-bold text-xs uppercase tracking-wider hover:brightness-110 shadow-glow-cyan transition-all flex items-center justify-center gap-1.5"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>Lọc Dự Án</span>
            </button>
            {(category || style || search || year || menh) && (
              <Link
                href="/projects"
                className="px-3 py-2.5 rounded-xl bg-thuy-800 text-slate-300 hover:text-white text-xs font-medium border border-thuy-700 flex items-center justify-center"
                title="Xóa bộ lọc"
              >
                Đặt lại
              </Link>
            )}
          </div>
        </form>

        {/* Quick Filter: Ngũ Hành Hợp Mệnh Chips */}
        <div className="pt-2 border-t border-thuy-750/70 space-y-2">
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            <span className="text-[11px] font-semibold text-thuy-300 uppercase tracking-wider flex items-center gap-1 flex-shrink-0">
              <Sparkles className="w-3 h-3 text-thuy-400" />
              <span>Hợp Mệnh:</span>
            </span>

            <Link
              href="/projects"
              className={`px-3 py-1 rounded-lg text-xs whitespace-nowrap transition-all ${
                !menh || menh === "all"
                  ? "bg-thuy-400 text-thuy-950 font-bold"
                  : "bg-thuy-900 text-slate-400 hover:text-white border border-thuy-750"
              }`}
            >
              Tất Cả Mệnh
            </Link>

            {menhOptions.map((m) => (
              <Link
                key={m.value}
                href={`/projects?menh=${m.value}`}
                className={`px-3 py-1 rounded-lg text-xs whitespace-nowrap transition-all ${
                  menh === m.value
                    ? "bg-thuy-400 text-thuy-950 font-bold"
                    : "bg-thuy-900 text-slate-400 hover:text-white border border-thuy-750"
                }`}
              >
                {m.label}
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Projects Grid */}
      <div className="space-y-6">
        <div className="flex items-center justify-between text-xs text-slate-400">
          <span>
            Tìm thấy <b className="text-thuy-400 font-semibold">{projects.length}</b> công trình
          </span>
        </div>

        {projects.length === 0 ? (
          <div className="text-center py-20 rounded-2xl bg-thuy-850/40 border border-thuy-800 space-y-3">
            <p className="text-slate-400 text-sm">
              Không tìm thấy dự án nào khớp với tiêu chí tìm kiếm của bạn.
            </p>
            <Link
              href="/projects"
              className="inline-block px-4 py-2 rounded-lg bg-thuy-400 text-thuy-950 font-semibold text-xs"
            >
              Xem tất cả dự án
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {projects.map((project) => (
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
                    <div className="w-full h-full bg-thuy-900" />
                  )}
                  <div className="absolute top-3 left-3 px-3 py-1 rounded-full bg-thuy-950/85 backdrop-blur-md border border-thuy-700 text-[11px] font-medium text-thuy-300">
                    {project.category?.name || "Kiến trúc"}
                  </div>
                  {project.area && (
                    <div className="absolute bottom-3 right-3 px-2 py-0.5 rounded bg-thuy-950/90 text-[11px] text-white font-medium border border-thuy-700">
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

                  {/* Tags Preview */}
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {project.tags.map((t) => (
                      <span
                        key={t.tag.id}
                        className={`text-[10px] px-2 py-0.5 rounded ${
                          t.tag.name.startsWith("Mệnh")
                            ? "bg-thuy-400/20 text-thuy-300 border border-thuy-400/30 font-semibold"
                            : "bg-thuy-900 text-slate-400 border border-thuy-750"
                        }`}
                      >
                        #{t.tag.name}
                      </span>
                    ))}
                  </div>

                  <div className="pt-4 border-t border-thuy-800 flex items-center justify-between text-xs">
                    <span className="text-thuy-400 font-semibold group-hover:translate-x-1 transition-transform inline-flex items-center gap-1">
                      Xem chi tiết <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                    <span className="text-slate-500">{project.style}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

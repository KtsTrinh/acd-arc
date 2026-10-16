import React from "react";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import LightboxGallery from "@/components/gallery/LightboxGallery";
import {
  MapPin,
  Calendar,
  Maximize2,
  Tag,
  Building,
  UserCheck,
  Compass,
  ArrowLeft,
  Share2,
} from "lucide-react";

export const revalidate = 0;

interface ProjectDetailPageProps {
  params: {
    slug: string;
  };
}

export default async function ProjectDetailPage({ params }: ProjectDetailPageProps) {
  const { slug } = params;

  const project = await prisma.project.findFirst({
    where: {
      OR: [{ slug }, { id: slug }],
    },
    include: {
      category: true,
      cover: true,
      tags: { include: { tag: true } },
      gallery: {
        orderBy: { sortOrder: "asc" },
        include: { media: true },
      },
    },
  });

  if (!project) {
    notFound();
  }

  // Gallery items for lightbox
  const galleryImages = project.gallery.map((g) => ({
    id: g.media.id,
    url: g.media.url,
    alt: g.media.alt || project.title,
    filename: g.media.filename,
  }));

  // If cover exists and not in gallery, prepend it
  if (project.cover && !galleryImages.some((img) => img.id === project.cover?.id)) {
    galleryImages.unshift({
      id: project.cover.id,
      url: project.cover.url,
      alt: project.cover.alt || project.title,
      filename: project.cover.filename,
    });
  }

  return (
    <div className="pt-28 pb-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
      {/* Back button & Category */}
      <div className="flex items-center justify-between">
        <Link
          href="/projects"
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-thuy-400 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Quay lại danh mục dự án</span>
        </Link>

        {project.category && (
          <Link
            href={`/projects?category=${project.category.slug}`}
            className="px-3.5 py-1 rounded-full bg-thuy-850 text-thuy-300 border border-thuy-700 text-xs font-medium hover:border-thuy-400 transition-colors"
          >
            {project.category.name}
          </Link>
        )}
      </div>

      {/* Project Header Info */}
      <div className="space-y-4 max-w-4xl">
        <h1 className="font-display font-extrabold text-3xl sm:text-5xl lg:text-6xl text-white tracking-tight leading-tight">
          {project.title}
        </h1>

        <div className="flex flex-wrap items-center gap-6 text-sm text-slate-300">
          {project.location && (
            <span className="flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-thuy-400" />
              {project.location}
            </span>
          )}
          {project.year && (
            <span className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-thuy-400" />
              Năm hoàn thành: {project.year}
            </span>
          )}
          {project.area && (
            <span className="flex items-center gap-1.5">
              <Maximize2 className="w-4 h-4 text-thuy-400" />
              Diện tích: {project.area} m²
            </span>
          )}
        </div>

        {project.shortDesc && (
          <p className="text-base text-slate-300 font-light leading-relaxed pt-2">
            {project.shortDesc}
          </p>
        )}
      </div>

      {/* Hero Cover Image */}
      {project.cover && (
        <div className="relative w-full aspect-[21/9] sm:aspect-[16/8] rounded-3xl overflow-hidden border border-thuy-750 bg-thuy-950 shadow-2xl">
          <Image
            src={project.cover.url}
            alt={project.cover.alt || project.title}
            fill
            className="object-cover"
            priority
            unoptimized
          />
          <div className="absolute inset-0 bg-gradient-to-t from-thuy-950/60 via-transparent to-transparent" />
        </div>
      )}

      {/* Project Meta Spec Sheet & Story Details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 pt-6">
        {/* Specification Column (Left) */}
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-thuy-850/70 border border-thuy-750 backdrop-blur-md space-y-4">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-thuy-400 border-b border-thuy-750 pb-3">
              Thông Tin Kỹ Thuật
            </h3>

            <div className="space-y-3.5 text-xs">
              <div className="flex justify-between py-1 border-b border-thuy-800">
                <span className="text-slate-400">Loại công trình:</span>
                <span className="font-medium text-white">{project.buildingType || "Biệt thự cao cấp"}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-thuy-800">
                <span className="text-slate-400">Phong cách:</span>
                <span className="font-medium text-white">{project.style || "Đương đại Mệnh Thủy"}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-thuy-800">
                <span className="text-slate-400">Diện tích sàn:</span>
                <span className="font-medium text-white">{project.area ? `${project.area} m²` : "Đang cập nhật"}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-thuy-800">
                <span className="text-slate-400">Năm thiết kế:</span>
                <span className="font-medium text-white">{project.year || "2026"}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-thuy-800">
                <span className="text-slate-400">Chủ đầu tư:</span>
                <span className="font-medium text-white">{project.client || "Khách hàng cá nhân"}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-400">Đơn vị chủ trì:</span>
                <span className="font-medium text-thuy-300">ACD Architecture Studio</span>
              </div>
            </div>
          </div>

          {/* Tags */}
          {project.tags.length > 0 && (
            <div className="space-y-2">
              <span className="text-xs text-slate-400 block font-medium">Thẻ phân loại:</span>
              <div className="flex flex-wrap gap-2">
                {project.tags.map((t) => (
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

        {/* Detailed Description Story (Right 2 cols) */}
        <div className="lg:col-span-2 space-y-6">
          <h2 className="font-display font-bold text-2xl text-white">
            Ý Tưởng Kiến Trúc & Chi Tiết Không Gian
          </h2>

          <div className="prose prose-invert prose-cyan max-w-none text-sm text-slate-300 leading-relaxed space-y-4">
            {project.description ? (
              <div
                dangerouslySetInnerHTML={{
                  __html: project.description.replace(/\n\n/g, "<br/><br/>"),
                }}
              />
            ) : (
              <p>
                Dự án được thực hiện bởi đội ngũ kiến trúc sư ACD Studio, tập trung vào việc tối ưu
                không gian mở, đón ánh sáng tự nhiên và thiết lập sự đối lưu vi khí hậu hài hòa với
                yếu tố phong thủy Mệnh Thủy.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Gallery Section with Lightbox */}
      <div className="pt-10 border-t border-thuy-800 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xs text-thuy-400 uppercase tracking-widest font-semibold block">
              Bộ Sưu Tập Hình Ảnh
            </span>
            <h2 className="font-display font-bold text-2xl sm:text-3xl text-white">
              Thư Viện Ảnh Công Trình
            </h2>
          </div>
          <span className="text-xs text-slate-400">
            {galleryImages.length} hình ảnh độ phân giải cao
          </span>
        </div>

        {/* Lightbox Gallery Grid */}
        <LightboxGallery images={galleryImages} projectTitle={project.title} />
      </div>
    </div>
  );
}


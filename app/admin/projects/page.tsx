import React from "react";
import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import { Plus, Edit2, Trash2, ExternalLink, MapPin, Calendar, Building2 } from "lucide-react";

export const revalidate = 0;

export default async function AdminProjectsPage() {
  const projects = await prisma.project.findMany({
    include: {
      category: true,
      cover: true,
      _count: {
        select: { gallery: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display font-bold text-2xl sm:text-3xl text-white">
            Quản Lý Dự Án Kiến Trúc
          </h1>
          <p className="text-xs text-slate-400">
            Danh sách tất cả công trình kiến trúc, nội thất, resort và penthouse của ACD Studio
          </p>
        </div>

        <Link
          href="/admin/projects/new"
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-thuy-400 text-thuy-950 font-bold text-xs uppercase hover:brightness-110 shadow-glow-cyan transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>+ Thêm Dự Án Mới</span>
        </Link>
      </div>

      {/* Projects Table */}
      <div className="rounded-2xl bg-thuy-850 border border-thuy-750 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-thuy-900/80 text-slate-400 uppercase font-semibold text-[10px] tracking-wider border-b border-thuy-750">
              <tr>
                <th className="py-3 px-5">Ảnh Cover</th>
                <th className="py-3 px-5">Tên Dự Án</th>
                <th className="py-3 px-5">Danh Mục</th>
                <th className="py-3 px-5">Thông Số</th>
                <th className="py-3 px-5">Số Ảnh Gallery</th>
                <th className="py-3 px-5 text-right">Thao Tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-thuy-750/60">
              {projects.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-slate-400 text-xs">
                    Chưa có dự án nào. Nhấn "+ Thêm Dự Án Mới" để tạo.
                  </td>
                </tr>
              ) : (
                projects.map((p) => (
                  <tr key={p.id} className="hover:bg-thuy-800/40 transition-colors">
                    <td className="py-3.5 px-5">
                      <div className="relative w-16 h-12 rounded-lg overflow-hidden bg-thuy-950 border border-thuy-700">
                        {p.cover ? (
                          <Image
                            src={p.cover.url}
                            alt={p.title}
                            fill
                            className="object-cover"
                            unoptimized
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-slate-600">
                            <Building2 className="w-4 h-4" />
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="py-3.5 px-5">
                      <Link
                        href={`/admin/projects/${p.id}`}
                        className="font-bold text-white hover:text-thuy-400 transition-colors block text-sm"
                      >
                        {p.title}
                      </Link>
                      <span className="text-[10px] text-slate-400 font-mono">/projects/{p.slug}</span>
                    </td>
                    <td className="py-3.5 px-5">
                      <span className="px-2.5 py-0.5 rounded-full bg-thuy-800 text-thuy-300 text-[10px] border border-thuy-700 font-medium">
                        {p.category?.name || "Chưa phân loại"}
                      </span>
                    </td>
                    <td className="py-3.5 px-5 text-slate-300">
                      <div>
                        {p.area && <span>{p.area} m² • </span>}
                        {p.year && <span>Năm {p.year}</span>}
                      </div>
                      <span className="text-[10px] text-slate-400 block">{p.location}</span>
                    </td>
                    <td className="py-3.5 px-5 font-semibold text-thuy-400">
                      {p._count.gallery} hình ảnh
                    </td>
                    <td className="py-3.5 px-5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/projects/${p.slug}`}
                          target="_blank"
                          className="p-1.5 rounded-lg bg-thuy-800 hover:bg-thuy-700 text-slate-300 hover:text-white"
                          title="Xem trang public"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </Link>
                        <Link
                          href={`/admin/projects/${p.id}`}
                          className="p-1.5 rounded-lg bg-thuy-400 text-thuy-950 font-bold hover:brightness-110"
                          title="Chỉnh sửa dự án & gallery kéo thả"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}


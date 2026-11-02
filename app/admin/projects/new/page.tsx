"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { slugify } from "@/lib/utils";
import MediaPickerModal, {
  MediaItem,
} from "@/components/media/MediaPickerModal";
import {
  ArrowLeft,
  Image as ImageIcon,
  Loader2,
  Plus,
  Sparkles,
} from "lucide-react";

export default function NewProjectPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<any[]>([]);
  const [tags, setTags] = useState<any[]>([]);

  // Form states
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [shortDesc, setShortDesc] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [client, setClient] = useState("");
  const [year, setYear] = useState("2026");
  const [area, setArea] = useState("");
  const [buildingType, setBuildingType] = useState("Biệt thự nghỉ dưỡng");
  const [style, setStyle] = useState("Modern Luxury");
  const [categoryId, setCategoryId] = useState("");
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);
  const [coverMedia, setCoverMedia] = useState<MediaItem | null>(null);
  const [isFeatured, setIsFeatured] = useState(true);

  const [isMediaModalOpen, setIsMediaModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([
      fetch("/api/categories").then((r) => r.json()),
      fetch("/api/tags").then((r) => r.json()),
    ]).then(([catData, tagData]) => {
      if (catData.categories) {
        setCategories(catData.categories);
        if (catData.categories.length > 0)
          setCategoryId(catData.categories[0].id);
      }
      if (tagData.tags) setTags(tagData.tags);
    });
  }, []);

  const handleTitleChange = (val: string) => {
    setTitle(val);
    setSlug(slugify(val));
  };

  const toggleTag = (id: string) => {
    if (selectedTagIds.includes(id)) {
      setSelectedTagIds(selectedTagIds.filter((t) => t !== id));
    } else {
      setSelectedTagIds([...selectedTagIds, id]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!title) {
      setError("Vui lòng nhập tên dự án");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          slug,
          shortDesc,
          description,
          location,
          client,
          year,
          area,
          style,
          buildingType,
          categoryId,
          coverId: coverMedia?.id,
          tagIds: selectedTagIds,
          isFeatured,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Không thể tạo dự án!");

      // Redirect to Project detail page to manage sortable gallery!
      router.push(`/admin/projects/${data.project.id}`);
    } catch (err: any) {
      setError(err.message || "Đã xảy ra lỗi!");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 -m-6 p-6">
      <div className="max-w-5xl mx-auto space-y-6 pb-20">
        <div className="flex items-center justify-between">
          <Link
            href="/admin/catalog?tab=MANAGE"
            className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Quay lại danh sách dự án</span>
          </Link>
          <h1 className="font-display font-bold text-2xl text-slate-900">
            Thêm Sản Phẩm Mới
          </h1>
        </div>

        {error && (
          <div className="p-3.5 rounded-xl bg-red-950/70 border border-red-700 text-red-300 text-xs">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info Card */}
          <div className="p-6 rounded-2xl bg-thuy-850 border border-thuy-750 space-y-4">
            <h2 className="font-semibold text-sm text-[#142338] border-b border-thuy-750 pb-2">
              1. Thông Tin Cơ Bản & Định Danh
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1 sm:col-span-2">
                <label className="text-xs text-slate-700 font-medium">
                  Tên dự án *:
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  placeholder="The Aqua Horizon Villa"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-thuy-900 border border-thuy-700 text-xs text-[#142338] focus:outline-none focus:border-thuy-400"
                />
              </div>

              <div className="space-y-1 sm:col-span-2">
                <label className="text-xs text-slate-700 font-medium">
                  Đường dẫn tĩnh (Slug):
                </label>
                <input
                  type="text"
                  required
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-thuy-900 border border-thuy-700 text-xs text-thuy-300 font-mono"
                />
              </div>

              <div className="space-y-1 sm:col-span-2">
                <label className="text-xs text-slate-700 font-medium">
                  Mô tả tóm tắt:
                </label>
                <input
                  type="text"
                  value={shortDesc}
                  placeholder="Bài viết tóm tắt ngắn về dự án, giải pháp kiến trúc và phong thủy..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-thuy-900 border border-thuy-700 text-xs text-[#142338]"
                />
              </div>

              <div className="space-y-1 sm:col-span-2">
                <label className="text-xs text-slate-700 font-medium">
                  BÀI VIẾT CHI TIẾT DỰ ÁN:
                </label>
                <textarea
                  rows={6}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Ấn vào đây để nhập nội dung, giải pháp kỹ thuật, vật liệu..."
                  className="w-full p-3.5 rounded-xl bg-thuy-900 border border-thuy-700 text-xs text-[#142338] leading-relaxed"
                />
              </div>
            </div>
          </div>

          {/* Specifications & Classification */}
          <div className="p-6 rounded-2xl bg-thuy-850 border border-thuy-750 space-y-4">
            <h2 className="font-semibold text-sm text-[#142338] border-b border-thuy-750 pb-2">
              2. Thông Số Kỹ Thuật & Phân Loại
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1">
                <label className="text-xs text-slate-700">Danh mục:</label>
                <select
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-thuy-900 border border-thuy-700 text-xs text-[#142338]"
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs text-slate-700">
                  Loại công trình:
                </label>
                <input
                  type="text"
                  value={buildingType}
                  onChange={(e) => setBuildingType(e.target.value)}
                  placeholder="Biệt thự, Nhà phố, Penthouse..."
                  className="w-full px-3 py-2.5 rounded-xl bg-thuy-900 border border-thuy-700 text-xs text-[#142338]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs text-slate-700">Phong cách:</label>
                <input
                  type="text"
                  value={style}
                  onChange={(e) => setStyle(e.target.value)}
                  placeholder="Modern, Minimalist, Wabi-Sabi..."
                  className="w-full px-3 py-2.5 rounded-xl bg-thuy-900 border border-thuy-700 text-xs text-[#142338]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs text-slate-700">
                  Diện tích (m²):
                </label>
                <input
                  type="number"
                  value={area}
                  onChange={(e) => setArea(e.target.value)}
                  placeholder="450"
                  className="w-full px-3 py-2.5 rounded-xl bg-thuy-900 border border-thuy-700 text-xs text-[#142338]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs text-slate-700">
                  Năm hoàn thành:
                </label>
                <input
                  type="number"
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-thuy-900 border border-thuy-700 text-xs text-[#142338]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs text-slate-700">Địa điểm:</label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Hạ Long, Quảng Ninh"
                  className="w-full px-3 py-2.5 rounded-xl bg-thuy-900 border border-thuy-700 text-xs text-[#142338]"
                />
              </div>
            </div>

            {/* Tags */}
            <div className="space-y-2 pt-2">
              <label className="text-xs text-slate-700 font-medium block">
                Chọn thẻ Tags:
              </label>
              <div className="flex flex-wrap gap-2">
                {tags.map((t) => {
                  const isSelected = selectedTagIds.includes(t.id);
                  return (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => toggleTag(t.id)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                        isSelected
                          ? "bg-thuy-400 text-thuy-950 font-bold shadow-sm"
                          : "bg-thuy-900 text-slate-600 border border-thuy-700 hover:text-[#142338]"
                      }`}
                    >
                      #{t.name}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Cover Picker Card */}
          <div className="p-6 rounded-2xl bg-thuy-850 border border-thuy-750 space-y-4">
            <div className="flex items-center justify-between border-b border-thuy-750 pb-2">
              <h2 className="font-semibold text-sm text-[#142338]">
                3. Ảnh Đại Diện (Cover Image)
              </h2>
              <button
                type="button"
                onClick={() => setIsMediaModalOpen(true)}
                className="px-3 py-1.5 rounded-lg bg-thuy-800 hover:bg-thuy-750 text-thuy-400 text-xs font-semibold border border-thuy-700"
              >
                Chọn Ảnh/Video
              </button>
            </div>

            {coverMedia ? (
              <div className="relative aspect-[21/9] rounded-2xl overflow-hidden bg-thuy-950 border border-thuy-700 max-w-lg">
                <Image
                  src={coverMedia.url}
                  alt="Cover preview"
                  fill
                  className="object-cover"
                  unoptimized
                />
                <button
                  type="button"
                  onClick={() => setCoverMedia(null)}
                  className="absolute top-2 right-2 p-1.5 rounded-lg bg-thuy-950/80 text-red-400 hover:text-[#142338]"
                >
                  Gỡ ảnh
                </button>
              </div>
            ) : (
              <div
                onClick={() => setIsMediaModalOpen(true)}
                className="border-2 border-dashed border-thuy-750 hover:border-thuy-400 rounded-2xl p-8 text-center cursor-pointer bg-thuy-900/40"
              >
                <ImageIcon className="w-8 h-8 mx-auto text-slate-500 mb-2" />
                <p className="text-xs text-slate-700">
                  Nhấp hoặc thả ảnh đại diện dự án từ Media Library
                </p>
              </div>
            )}
          </div>

          {/* Submit */}
          <div className="flex justify-end gap-3 pt-4">
            <Link
              href="/admin/catalog?tab=MANAGE"
              className="px-5 py-2.5 rounded-xl bg-thuy-850 text-slate-700 hover:text-[#142338] text-xs font-semibold border border-thuy-750"
            >
              Hủy
            </Link>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 rounded-xl bg-thuy-400 text-thuy-950 font-bold text-xs uppercase tracking-wider hover:brightness-110 shadow-glow-cyan transition-all flex items-center gap-2"
            >
              {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
              <span>TẠO DỰ ÁN & CHỌN GALLERY</span>
            </button>
          </div>
        </form>

        {/* Media Picker Modal */}
        <MediaPickerModal
          isOpen={isMediaModalOpen}
          onClose={() => setIsMediaModalOpen(false)}
          onSelect={(selected) => {
            if (!Array.isArray(selected)) {
              setCoverMedia(selected);
            }
          }}
          multiple={false}
          selectedIds={coverMedia ? [coverMedia.id] : []}
          title="Chọn ảnh đại diện dự án"
        />
      </div>
    </div>
  );
}

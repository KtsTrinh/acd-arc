"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import SortableGallery from "@/components/admin/SortableGallery";
import MediaPickerModal, {
  MediaItem,
} from "@/components/media/MediaPickerModal";
import { slugify } from "@/lib/utils";
import {
  ArrowLeft,
  Image as ImageIcon,
  Loader2,
  Save,
  Trash2,
  ExternalLink,
  Star,
} from "lucide-react";

export default function EditProjectPage({
  params,
}: {
  params: { id: string };
}) {
  const router = useRouter();
  const [project, setProject] = useState<any>(null);
  const [categories, setCategories] = useState<any[]>([]);
  const [tags, setTags] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Form states
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [shortDesc, setShortDesc] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [client, setClient] = useState("");
  const [year, setYear] = useState("");
  const [area, setArea] = useState("");
  const [style, setStyle] = useState("");
  const [buildingType, setBuildingType] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);
  const [coverMediaId, setCoverMediaId] = useState<string | null>(null);
  const [coverMedia, setCoverMedia] = useState<any | null>(null);

  const [isCoverPickerOpen, setIsCoverPickerOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState("");

  const fetchProjectData = async () => {
    try {
      const [projRes, catRes, tagRes] = await Promise.all([
        fetch(`/api/projects/${params.id}`).then((r) => r.json()),
        fetch("/api/categories").then((r) => r.json()),
        fetch("/api/tags").then((r) => r.json()),
      ]);

      if (projRes.project) {
        const p = projRes.project;
        setProject(p);
        setTitle(p.title);
        setSlug(p.slug);
        setShortDesc(p.shortDesc || "");
        setDescription(p.description || "");
        setLocation(p.location || "");
        setClient(p.client || "");
        setYear(p.year ? p.year.toString() : "");
        setArea(p.area ? p.area.toString() : "");
        setStyle(p.style || "");
        setBuildingType(p.buildingType || "");
        setCategoryId(p.categoryId || "");
        setSelectedTagIds(p.tags?.map((t: any) => t.tagId) || []);
        setCoverMediaId(p.coverId || null);
        setCoverMedia(p.cover || null);
      }
      if (catRes.categories) setCategories(catRes.categories);
      if (tagRes.tags) setTags(tagRes.tags);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjectData();
  }, [params.id]);

  const toggleTag = (id: string) => {
    if (selectedTagIds.includes(id)) {
      setSelectedTagIds(selectedTagIds.filter((t) => t !== id));
    } else {
      setSelectedTagIds([...selectedTagIds, id]);
    }
  };

  const handleSaveDetails = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setMessage("");

    try {
      const res = await fetch(`/api/projects/${params.id}`, {
        method: "PATCH",
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
          coverId: coverMediaId,
          tagIds: selectedTagIds,
        }),
      });
      const data = await res.json();
      if (data.project) {
        setProject(data.project);
        setMessage("Đã cập nhật dự án thành công!");
        setTimeout(() => setMessage(""), 3000);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteProject = async () => {
    if (
      !confirm(
        "Bạn có chắc chắn muốn xóa dự án này? Thao tác không thể hoàn tác.",
      )
    )
      return;

    try {
      await fetch(`/api/projects/${params.id}`, { method: "DELETE" });
      router.push("/admin/catalog?tab=MANAGE");
    } catch (err) {
      console.error(err);
    }
  };

  const handleCoverSelected = (selected: MediaItem | MediaItem[]) => {
    if (!Array.isArray(selected)) {
      setCoverMediaId(selected.id);
      setCoverMedia(selected);
      // Automatically save new cover to backend
      fetch(`/api/projects/${params.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ coverId: selected.id }),
      });
    }
  };

  if (loading) {
    return (
      <div className="py-20 text-center text-slate-600">
        Đang tải thông tin dự án...
      </div>
    );
  }

  if (!project) {
    return (
      <div className="py-20 text-center space-y-3">
        <h2 className="text-[#142338]">Không tìm thấy dự án.</h2>
        <Link
          href="/admin/catalog?tab=MANAGE"
          className="text-thuy-400 text-xs"
        >
          Quay lại danh sách
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-10 pb-24">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-thuy-750 pb-4">
        <div className="space-y-1">
          <Link
            href="/admin/catalog?tab=MANAGE"
            className="inline-flex items-center gap-1.5 text-xs text-slate-600 hover:text-thuy-400"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Danh sách dự án</span>
          </Link>
          <h1 className="font-display font-bold text-2xl text-[#142338]">
            Chỉnh Sửa Dự Án: {project.title}
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href={`/projects/${project.slug}`}
            target="_blank"
            className="px-3.5 py-2 rounded-xl bg-thuy-850 text-slate-700 hover:text-[#142338] border border-thuy-700 text-xs font-semibold flex items-center gap-1.5"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>Xem Public</span>
          </Link>

          <button
            onClick={handleDeleteProject}
            className="px-3.5 py-2 rounded-xl bg-red-950/60 text-red-400 hover:bg-red-900 border border-red-800 text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Xóa Dự Án</span>
          </button>
        </div>
      </div>

      {message && (
        <div className="p-3.5 rounded-xl bg-emerald-950/80 border border-emerald-600 text-emerald-300 text-xs animate-in fade-in">
          {message}
        </div>
      )}

      {/* SECTION 1: DND-KIT SORTABLE GALLERY (KEY REQUIREMENT) */}
      <div className="p-6 rounded-3xl bg-thuy-850 border border-thuy-750 space-y-5 shadow-2xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-thuy-750 pb-3">
          <div>
            <h2 className="font-display font-bold text-lg text-[#142338] flex items-center gap-2">
              <ImageIcon className="w-5 h-5 text-thuy-400" />
              <span>Gallery Kéo-Thả (dnd-kit Sortable)</span>
            </h2>
            <p className="text-xs text-slate-600">
              Kéo thả các thẻ để đổi thứ tự hiển thị. Nhấn biểu tượng ngôi sao
              để chọn làm ảnh Cover. Thay đổi được lưu tự động không cần reload
              trang.
            </p>
          </div>
        </div>

        {/* The Sortable Gallery Component */}
        <SortableGallery
          projectId={project.id}
          initialItems={project.gallery || []}
          coverMediaId={coverMediaId}
          onCoverChange={(newCoverMediaId) => {
            setCoverMediaId(newCoverMediaId);
            fetch(`/api/projects/${project.id}`, {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ coverId: newCoverMediaId }),
            });
          }}
        />
      </div>

      {/* SECTION 2: PROJECT METADATA FORM */}
      <form onSubmit={handleSaveDetails} className="space-y-6">
        <div className="p-6 rounded-3xl bg-thuy-850 border border-thuy-750 space-y-4 shadow-xl">
          <h2 className="font-semibold text-sm text-[#142338] border-b border-thuy-750 pb-2">
            Thông Tin Chi Tiết & Thông Số Kỹ Thuật
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
                onChange={(e) => {
                  setTitle(e.target.value);
                  setSlug(slugify(e.target.value));
                }}
                className="w-full px-3.5 py-2.5 rounded-xl bg-thuy-900 border border-thuy-700 text-xs text-white focus:outline-none focus:border-thuy-400"
              />
            </div>

            <div className="space-y-1 sm:col-span-2">
              <label className="text-xs text-slate-700 font-medium">
                Slug URL:
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
                onChange={(e) => setShortDesc(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-thuy-900 border border-thuy-700 text-xs text-[#142338]"
              />
            </div>

            <div className="space-y-1 sm:col-span-2">
              <label className="text-xs text-slate-700 font-medium">
                Nội dung bài viết chi tiết:
              </label>
              <textarea
                rows={6}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full p-3.5 rounded-xl bg-thuy-900 border border-thuy-700 text-xs text-[#142338] leading-relaxed"
              />
            </div>

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
              <label className="text-xs text-slate-700">Loại công trình:</label>
              <input
                type="text"
                value={buildingType}
                onChange={(e) => setBuildingType(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-thuy-900 border border-thuy-700 text-xs text-[#142338]"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs text-slate-700">Phong cách:</label>
              <input
                type="text"
                value={style}
                onChange={(e) => setStyle(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-thuy-900 border border-thuy-700 text-xs text-[#142338]"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs text-slate-700">Diện tích (m²):</label>
              <input
                type="number"
                value={area}
                onChange={(e) => setArea(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-thuy-900 border border-thuy-700 text-xs text-[#142338]"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs text-slate-700">Năm thiết kế:</label>
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
                className="w-full px-3 py-2.5 rounded-xl bg-thuy-900 border border-thuy-700 text-xs text-[#142338]"
              />
            </div>

            <div className="space-y-1 sm:col-span-2">
              <label className="text-xs text-slate-700">Chủ đầu tư:</label>
              <input
                type="text"
                value={client}
                onChange={(e) => setClient(e.target.value)}
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
                        ? "bg-thuy-400 text-thuy-950 font-bold"
                        : "bg-thuy-900 text-slate-600 border border-thuy-700 hover:text-[#142338]"
                    }`}
                  >
                    #{t.name}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Cover Selector */}
          <div className="pt-4 border-t border-thuy-750 flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-[#142338] block">
                Ảnh Cover Dự Án
              </span>
              <span className="text-[11px] text-slate-600">
                {coverMedia ? coverMedia.filename : "Chưa có ảnh cover"}
              </span>
            </div>
            <button
              type="button"
              onClick={() => setIsCoverPickerOpen(true)}
              className="px-3 py-1.5 rounded-lg bg-thuy-800 hover:bg-thuy-750 text-thuy-300 text-xs font-semibold border border-thuy-700"
            >
              Đổi Cover Từ Media
            </button>
          </div>

          <div className="flex justify-end pt-4">
            <button
              type="submit"
              disabled={isSaving}
              className="px-6 py-2.5 rounded-xl bg-thuy-400 text-thuy-950 font-bold text-xs uppercase tracking-wider hover:brightness-110 shadow-glow-cyan flex items-center gap-2"
            >
              {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
              <span>Lưu Thông Tin Dự Án</span>
            </button>
          </div>
        </div>
      </form>

      {/* Cover Picker Modal */}
      <MediaPickerModal
        isOpen={isCoverPickerOpen}
        onClose={() => setIsCoverPickerOpen(false)}
        onSelect={handleCoverSelected}
        multiple={false}
        selectedIds={coverMediaId ? [coverMediaId] : []}
        title="Chọn ảnh đại diện Cover"
      />
    </div>
  );
}

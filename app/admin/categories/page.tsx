"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { Plus, Trash2, FolderTree, Loader2 } from "lucide-react";
import { slugify } from "@/lib/utils";

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Form states
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  const fetchCategories = async () => {
    try {
      const res = await fetch("/api/categories");
      const data = await res.json();
      if (data.categories) setCategories(data.categories);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleNameChange = (val: string) => {
    setName(val);
    setSlug(slugify(val));
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;

    setIsCreating(true);
    try {
      const res = await fetch("/api/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, slug, description, image }),
      });
      const data = await res.json();
      if (data.category) {
        setName("");
        setSlug("");
        setDescription("");
        setImage("");
        fetchCategories();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display font-bold text-2xl sm:text-3xl text-white">
          Quản Lý Danh Mục Dự Án
        </h1>
        <p className="text-xs text-slate-400">
          Phân loại các dự án kiến trúc (Biệt thự, Nhà phố, Nội thất, Penthouse, Resort...)
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left Col: Create Form */}
        <div className="p-6 rounded-2xl bg-thuy-850 border border-thuy-750 space-y-4">
          <h2 className="font-semibold text-sm text-white flex items-center gap-2 border-b border-thuy-750 pb-2">
            <Plus className="w-4 h-4 text-thuy-400" />
            <span>Thêm Danh Mục Mới</span>
          </h2>

          <form onSubmit={handleCreate} className="space-y-3.5">
            <div className="space-y-1">
              <label className="text-xs text-slate-300 font-medium">Tên danh mục *:</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => handleNameChange(e.target.value)}
                placeholder="Biệt Thự & Villa..."
                className="w-full px-3 py-2 rounded-xl bg-thuy-900 border border-thuy-700 text-xs text-white"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs text-slate-300 font-medium">Slug URL:</label>
              <input
                type="text"
                required
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-thuy-900 border border-thuy-700 text-xs text-thuy-300 font-mono"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs text-slate-300 font-medium">Ảnh đại diện danh mục (URL):</label>
              <input
                type="url"
                value={image}
                onChange={(e) => setImage(e.target.value)}
                placeholder="https://images.unsplash.com/..."
                className="w-full px-3 py-2 rounded-xl bg-thuy-900 border border-thuy-700 text-xs text-white"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs text-slate-300 font-medium">Mô tả ngắn:</label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Mô tả danh mục..."
                className="w-full p-3 rounded-xl bg-thuy-900 border border-thuy-700 text-xs text-white"
              />
            </div>

            <button
              type="submit"
              disabled={isCreating}
              className="w-full py-2.5 rounded-xl bg-thuy-400 text-thuy-950 font-bold text-xs uppercase hover:brightness-110 shadow-glow-cyan flex items-center justify-center gap-2"
            >
              {isCreating && <Loader2 className="w-4 h-4 animate-spin" />}
              <span>Tạo Danh Mục</span>
            </button>
          </form>
        </div>

        {/* Right Col: Category List */}
        <div className="lg:col-span-2 rounded-2xl bg-thuy-850 border border-thuy-750 overflow-hidden shadow-xl">
          <div className="p-4 border-b border-thuy-750">
            <h2 className="font-semibold text-sm text-white">
              Danh Mục Hiện Có ({categories.length})
            </h2>
          </div>

          <div className="divide-y divide-thuy-750/60">
            {categories.map((c) => (
              <div key={c.id} className="p-4 flex items-center justify-between gap-4 hover:bg-thuy-800/40">
                <div className="flex items-center gap-3">
                  {c.image ? (
                    <div className="relative w-14 h-14 rounded-xl overflow-hidden bg-thuy-950 flex-shrink-0">
                      <Image src={c.image} alt={c.name} fill className="object-cover" unoptimized />
                    </div>
                  ) : (
                    <div className="w-14 h-14 rounded-xl bg-thuy-900 flex items-center justify-center text-slate-500 flex-shrink-0">
                      <FolderTree className="w-6 h-6" />
                    </div>
                  )}

                  <div>
                    <h3 className="font-bold text-sm text-white">{c.name}</h3>
                    <p className="text-[11px] text-slate-400 font-mono">/projects?category={c.slug}</p>
                    <span className="text-[11px] text-thuy-400 font-semibold">
                      {c._count?.projects || 0} dự án đang thuộc danh mục này
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}


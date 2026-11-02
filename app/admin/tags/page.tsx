"use client";

import React, { useState, useEffect } from "react";
import { Plus, Tags, Loader2, Trash2 } from "lucide-react";

export default function AdminTagsPage() {
  const [tags, setTags] = useState<any[]>([]);
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);

  const fetchTags = async () => {
    try {
      const res = await fetch("/api/tags");
      const data = await res.json();
      if (data.tags) setTags(data.tags);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTags();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;

    setIsCreating(true);
    try {
      const res = await fetch("/api/tags", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      const data = await res.json();
      if (data.tag) {
        setName("");
        fetchTags();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsCreating(false);
    }
  };

const handleDelete = async (id: string) => {
    if (!confirm("Xóa th? tag này?")) return;
    try {
      const res = await fetch(`/api/tags?id=${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) fetchTags();
    } catch (err) {
      console.error(err);
    }
  };
  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="font-display font-bold text-2xl sm:text-3xl text-[#142338]">
          Qu?n Lý Th? Phân Lo?i (Tags)
        </h1>
        <p className="text-xs text-slate-600">
          G?n nhãn phong cách và d?c di?m ki?n trúc cho d? án và bài vi?t.
        </p>
      </div>

      <div className="p-6 rounded-2xl bg-thuy-850 border border-thuy-750 space-y-4">
        <form onSubmit={handleCreate} className="flex gap-3">
          <input
            type="text"
            required
            placeholder="Tên th? tag m?i (ví d?: Bi?t Th?, Hi?n Ð?i, Wabi-Sabi, H?u Hi?n Ð?i...)"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="flex-1 px-4 py-2.5 rounded-xl bg-thuy-900 border border-thuy-700 text-xs text-[#142338] focus:outline-none focus:border-thuy-400"
          />
          <button
            type="submit"
            disabled={isCreating}
            className="px-5 py-2.5 rounded-xl bg-thuy-400 text-thuy-950 font-bold text-xs uppercase hover:brightness-110 shadow-glow-cyan flex items-center gap-1.5"
          >
            {isCreating && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            <span>THÊM TAG</span>
          </button>
        </form>

        <div className="pt-4 border-t border-thuy-750 flex flex-wrap gap-2.5">
          {tags.map((t) => (
            <div
              key={t.id}
              className="px-3.5 py-1.5 rounded-xl bg-thuy-900 border border-thuy-700 text-xs font-medium text-slate-200 flex items-center gap-2"
            >
              <span>#{t.name}</span>
              <span className="text-[10px] text-thuy-400 font-bold bg-thuy-800 px-1.5 py-0.5 rounded">
                {t._count?.projects || 0} d? án
              </span>
              <button
                onClick={() => handleDelete(t.id)}
                className="ml-1 text-red-400 hover:text-red-300"
                title="Xóa"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}


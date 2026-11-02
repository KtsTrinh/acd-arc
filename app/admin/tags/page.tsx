"use client";

import React, { useState, useEffect } from "react";
import { Plus, Tags, Loader2, Trash2, Pencil, X } from "lucide-react";

export default function AdminTagsPage() {
  const [tags, setTags] = useState<any[]>([]);
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);
  const [modal, setModal] = useState<{
    type: "delete" | "rename";
    tag: any;
    value: string;
  } | null>(null);

  const showToast = (message: string, type: "success" | "error") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

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
        showToast("Thêm Tag thành công", "success");
      } else if (data.error) {
        showToast(data.error, "error");
      }
    } catch (err) {
      console.error(err);
      showToast("Lỗi khi thêm Tag", "error");
    } finally {
      setIsCreating(false);
    }
  };

  const confirmDelete = async () => {
    if (!modal) return;
    const id = modal.tag.id;
    setModal(null);
    try {
      const res = await fetch(`/api/tags?id=${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        fetchTags();
        showToast("Xóa Tag thành công", "success");
      } else if (data.error) {
        showToast(data.error, "error");
      }
    } catch (err) {
      console.error(err);
      showToast("Lỗi khi xóa Tag", "error");
    }
  };

  const confirmRename = async () => {
    if (!modal) return;
    const { tag, value } = modal;
    setModal(null);
    if (!value || value === tag.name) return;
    try {
      const res = await fetch("/api/tags", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: tag.id, name: value }),
      });
      const data = await res.json();
      if (data.success) {
        fetchTags();
        showToast("Đổi tên Tag thành công", "success");
      } else if (data.error) {
        showToast(data.error, "error");
      }
    } catch (err) {
      console.error(err);
      showToast("Lỗi khi đổi tên Tag", "error");
    }
  };

  return (
    <div className="space-y-6 max-w-4xl relative">
      {toast && (
        <div
          className={`fixed top-6 right-6 z-50 px-6 py-4 rounded-xl shadow-lg text-sm font-medium text-white transition-all duration-300 ease-out ${toast.type === "success" ? "bg-green-600" : "bg-red-600"}`}
        >
          {toast.message}
        </div>
      )}

      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md mx-4 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-bold text-lg text-[#142338]">
                {modal.type === "delete" ? "Xóa Tag" : "Đổi tên Tag"}
              </h2>
              <button
                onClick={() => setModal(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            {modal.type === "rename" && (
              <input
                type="text"
                value={modal.value}
                onChange={(e) => setModal({ ...modal, value: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-100 border border-slate-300 text-sm text-[#142338] focus:outline-none focus:border-thuy-400"
              />
            )}
            {modal.type === "delete" && (
              <p className="text-sm text-slate-600">
                Bạn có chắc chắn muốn xóa Tag #{modal.tag.name}?
              </p>
            )}
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setModal(null)}
                className="px-4 py-2 rounded-xl bg-slate-200 text-slate-700 text-sm font-medium hover:bg-slate-300"
              >
                Hủy
              </button>
              <button
                onClick={
                  modal.type === "delete" ? confirmDelete : confirmRename
                }
                className={`px-4 py-2 rounded-xl text-white text-sm font-medium ${modal.type === "delete" ? "bg-red-600 hover:bg-red-700" : "bg-blue-600 hover:bg-blue-700"}`}
              >
                {modal.type === "delete" ? "Xóa" : "Lưu"}
              </button>
            </div>
          </div>
        </div>
      )}

      <div>
        <h1 className="font-display font-bold text-2xl sm:text-3xl text-[#142338]">
          Quản Lý Thẻ Phân Loại (Tags)
        </h1>
        <p className="text-xs text-slate-600">
          Gán nhãn phong cách và đặc điểm cho sản phẩm.
        </p>
      </div>

      <div className="p-6 rounded-2xl bg-thuy-850 border border-thuy-750 space-y-4">
        <form onSubmit={handleCreate} className="flex gap-3">
          <input
            type="text"
            required
            placeholder="Tên thẻ Tag mới"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="flex-1 px-4 py-2.5 rounded-xl bg-thuy-900 border border-thuy-700 text-xs text-white focus:outline-none focus:border-thuy-400"
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
                {t._count?.projects || 0} sản phẩm
              </span>
              <button
                onClick={() =>
                  setModal({ type: "rename", tag: t, value: t.name })
                }
                className="ml-1 text-blue-400 hover:text-blue-300"
                title="Sửa"
              >
                <Pencil className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setModal({ type: "delete", tag: t, value: "" })}
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

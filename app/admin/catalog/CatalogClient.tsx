"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { formatVND, slugify } from "@/lib/utils";
import {
  CATALOG_GROUPS,
  PRODUCT_TYPE_LABELS,
  getCatalogGroupOfType,
} from "@/lib/catalog";
import MediaPickerModal, { MediaItem } from "@/components/media/MediaPickerModal";
import {
  Plus,
  Trash2,
  Pencil,
  Download,
  Loader2,
  X,
  Upload,
  Link2,
  FolderTree,
  Building2,
  Check,
  FileCode,
  Clock,
  ShieldCheck,
  Package,
} from "lucide-react";

interface ItemForm {
  id?: string;
  name: string;
  slug: string;
  description: string;
  price: string;
  comparePrice: string;
  type: string;
  fileFormat: string;
  fileSize: string;
  fileKey: string;
  fileName: string;
  downloadLinkUrl: string;
  downloadExpiresMinutes: string;
  thumbnail: string;
  projectId: string;
  requiresPayment: boolean;
  active: boolean;
  featured: boolean;
}

const EMPTY_FORM: ItemForm = {
  name: "",
  slug: "",
  description: "",
  price: "",
  comparePrice: "",
  type: "ARCHITECTURE",
  fileFormat: "",
  fileSize: "",
  fileKey: "",
  fileName: "",
  downloadLinkUrl: "",
  downloadExpiresMinutes: "5",
  thumbnail: "",
  projectId: "",
  requiresPayment: true,
  active: true,
  featured: false,
};

const EXPIRY_OPTIONS = [
  { value: "5", label: "5 phút (mặc định)" },
  { value: "15", label: "15 phút" },
  { value: "30", label: "30 phút" },
  { value: "60", label: "1 giờ" },
  { value: "1440", label: "24 giờ" },
];

export default function AdminCatalogClient({
  initialTab,
}: {
  initialTab?: string;
}) {
  const [activeTab, setActiveTab] = useState(
    initialTab && initialTab !== "ALL" ? initialTab : "ARCHITECTURE"
  );
  const [items, setItems] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState<ItemForm | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [mediaPickerOpen, setMediaPickerOpen] = useState(false);
  const [notice, setNotice] = useState<{ type: "ok" | "err"; text: string } | null>(
    null
  );

  const fetchAll = useCallback(async () => {
    try {
      const [itemsRes, projectsRes, categoriesRes] = await Promise.all([
        fetch("/api/products?includeInactive=1"),
        fetch("/api/projects"),
        fetch("/api/categories"),
      ]);
      const itemsData = await itemsRes.json();
      const projectsData = await projectsRes.json();
      const categoriesData = await categoriesRes.json();
      setItems(itemsData.products || []);
      setProjects(projectsData.projects || []);
      setCategories(categoriesData.categories || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const groupItems = useMemo(() => {
    const group = CATALOG_GROUPS.find((g) => g.key === activeTab);
    if (!group) return [];
    return items.filter((i) => group.types.includes(i.type));
  }, [items, activeTab]);

  const openCreate = (groupKey: string) => {
    const group = CATALOG_GROUPS.find((g) => g.key === groupKey);
    setForm({ ...EMPTY_FORM, type: group?.types[0] || "ARCHITECTURE" });
  };

  const openEdit = (item: any) => {
    setForm({
      id: item.id,
      name: item.name || "",
      slug: item.slug || "",
      description: item.description || "",
      price: String(item.price ?? ""),
      comparePrice: item.comparePrice != null ? String(item.comparePrice) : "",
      type: item.type,
      fileFormat: item.fileFormat || "",
      fileSize: item.fileSize || "",
      fileKey: item.fileKey || "",
      fileName: item.fileName || "",
      downloadLinkUrl: item.downloadLinkUrl || "",
      downloadExpiresMinutes: String(item.downloadExpiresMinutes ?? 5),
      thumbnail: item.thumbnail || "",
      projectId: item.projectId || "",
      requiresPayment: item.requiresPayment !== false,
      active: item.active !== false,
      featured: Boolean(item.featured),
    });
  };

  const updateForm = (patch: Partial<ItemForm>) =>
    setForm((prev) => (prev ? { ...prev, ...patch } : prev));

  const handleUploadFile = async (file: File) => {
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/products/file", { method: "POST", body: fd });
      const data = await res.json();
      if (data.success) {
        updateForm({
          fileKey: data.fileKey,
          fileName: data.fileName,
          fileSize: data.fileSize,
        });
        setNotice({ type: "ok", text: `Đã tải file "${data.fileName}" lên kho private.` });
      } else {
        setNotice({ type: "err", text: data.error || "Không tải được file." });
      }
    } catch (err) {
      console.error(err);
      setNotice({ type: "err", text: "Lỗi khi tải file lên." });
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form) return;
    setSaving(true);
    try {
      const payload = {
        name: form.name,
        slug: form.slug,
        description: form.description,
        price: parseFloat(form.price || "0"),
        comparePrice: form.comparePrice ? parseFloat(form.comparePrice) : null,
        type: form.type,
        fileFormat: form.fileFormat,
        fileSize: form.fileSize,
        fileKey: form.fileKey || null,
        fileName: form.fileName || null,
        downloadLinkUrl: form.downloadLinkUrl || null,
        downloadExpiresMinutes: parseInt(form.downloadExpiresMinutes || "5", 10),
        thumbnail: form.thumbnail,
        projectId: form.projectId || null,
        requiresPayment: form.requiresPayment,
        active: form.active,
        featured: form.featured,
      };

      const res = await fetch(
        form.id ? `/api/products/${form.id}` : "/api/products",
        {
          method: form.id ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );
      const data = await res.json();
      if (data.success) {
        setForm(null);
        setNotice({ type: "ok", text: "Đã lưu mục danh mục sản phẩm." });
        fetchAll();
      } else {
        setNotice({ type: "err", text: data.error || "Không lưu được." });
      }
    } catch (err) {
      console.error(err);
      setNotice({ type: "err", text: "Lỗi khi lưu mục danh mục." });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Bạn có chắc muốn xoá "${name}"?`)) return;
    const res = await fetch(`/api/products/${id}`, { method: "DELETE" });
    const data = await res.json();
    if (data.success) {
      setNotice({ type: "ok", text: "Đã xoá mục danh mục." });
      fetchAll();
    } else {
      setNotice({ type: "err", text: data.error || "Không xoá được." });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display font-bold text-2xl sm:text-3xl text-white">
            Danh Mục Sản Phẩm
          </h1>
          <p className="text-xs text-slate-400">
            Gộp Dự Án Kiến Trúc · Danh Mục Dự Án · Sản Phẩm &amp; File 3D/CAD — gồm 4 nhóm: Dự án
            kiến trúc, Nội thất, Xây dựng và File kỹ thuật số.
          </p>
        </div>

        {activeTab !== "MANAGE" && (
          <button
            onClick={() => openCreate(activeTab)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-thuy-400 text-thuy-950 font-bold text-xs uppercase hover:brightness-110 shadow-glow-cyan transition-all self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>+ Thêm mục</span>
          </button>
        )}
      </div>

      {/* Policy banner */}
      <div className="p-4 rounded-2xl bg-thuy-850/70 border border-thuy-750 flex flex-col sm:flex-row sm:items-center gap-3 text-xs text-slate-300">
        <ShieldCheck className="w-4 h-4 text-emerald-400 flex-shrink-0" />
        <p>
          File/link tải về chỉ mở cho <b className="text-white">đúng tài khoản đã thanh toán</b>.
          Link tự xuất hiện trong vòng <b className="text-white">5 phút</b> kể từ lúc đơn hàng
          được xác nhận thanh toán, hết hạn sau 5 phút và tối đa 5 lượt tải. Link gốc do quản
          trị cấu hình được phát qua máy chủ nên khách không thể chia sẻ cho người khác tải.
        </p>
      </div>

      {notice && (
        <div
          className={`p-3 rounded-xl text-xs border ${
            notice.type === "ok"
              ? "bg-emerald-500/10 border-emerald-500/40 text-emerald-300"
              : "bg-red-500/10 border-red-500/40 text-red-300"
          }`}
        >
          {notice.text}
        </div>
      )}

      {/* Tabs */}
      <div className="flex flex-wrap gap-2">
        {CATALOG_GROUPS.map((group) => {
          const count = items.filter((i) => group.types.includes(i.type)).length;
          const isActive = activeTab === group.key;
          return (
            <button
              key={group.key}
              onClick={() => setActiveTab(group.key)}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all border ${
                isActive
                  ? "bg-thuy-400 text-thuy-950 border-thuy-400 shadow-glow-cyan"
                  : "bg-thuy-850 text-slate-300 border-thuy-750 hover:border-thuy-500"
              }`}
            >
              {group.label}
              <span
                className={`ml-2 px-1.5 py-0.5 rounded-full text-[10px] ${
                  isActive ? "bg-thuy-950/20" : "bg-thuy-800 text-thuy-300"
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
        <button
          onClick={() => setActiveTab("MANAGE")}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all border ${
            activeTab === "MANAGE"
              ? "bg-thuy-400 text-thuy-950 border-thuy-400 shadow-glow-cyan"
              : "bg-thuy-850 text-slate-300 border-thuy-750 hover:border-thuy-500"
          }`}
        >
          <FolderTree className="w-3.5 h-3.5 inline mr-1.5" />
          Danh Mục & Dự Án Hiển Thị
        </button>
      </div>

      {loading ? (
        <div className="py-16 text-center text-slate-400 text-xs flex items-center justify-center gap-2">
          <Loader2 className="w-4 h-4 animate-spin" /> Đang tải danh mục sản phẩm...
        </div>
      ) : activeTab === "MANAGE" ? (
        <ManagePanel
          categories={categories}
          projects={projects}
          items={items}
          onRefresh={fetchAll}
          onNotice={setNotice}
        />
      ) : (
        <CatalogTable
          items={groupItems}
          groupKey={activeTab}
          onEdit={openEdit}
          onDelete={handleDelete}
        />
      )}

      {/* Modal create / edit */}
      {form && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-thuy-950/80 backdrop-blur-sm"
            onClick={() => setForm(null)}
          />
          <div className="relative z-10 w-full max-w-2xl bg-thuy-900 border border-thuy-700 rounded-3xl p-6 shadow-2xl space-y-4 max-h-[92vh] overflow-y-auto">
            <div className="flex justify-between items-center pb-2 border-b border-thuy-750">
              <h3 className="font-semibold text-base text-white">
                {form.id ? "Cập nhật mục danh mục" : "Thêm mục danh mục sản phẩm"}
              </h3>
              <button onClick={() => setForm(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs text-slate-300">Tên mục *:</label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) =>
                    updateForm({
                      name: e.target.value,
                      slug: form.id ? form.slug : slugify(e.target.value),
                    })
                  }
                  placeholder="Trọn bộ hồ sơ thiết kế biệt thự hiện đại 3 tầng"
                  className="w-full px-3 py-2 rounded-xl bg-thuy-800 border border-thuy-700 text-xs text-white"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="text-xs text-slate-300">Giá bán (VNĐ) *:</label>
                  <input
                    type="number"
                    required
                    value={form.price}
                    onChange={(e) => updateForm({ price: e.target.value })}
                    placeholder="850000"
                    className="w-full px-3 py-2 rounded-xl bg-thuy-800 border border-thuy-700 text-xs text-white"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-slate-300">Giá so sánh:</label>
                  <input
                    type="number"
                    value={form.comparePrice}
                    onChange={(e) => updateForm({ comparePrice: e.target.value })}
                    placeholder="1200000"
                    className="w-full px-3 py-2 rounded-xl bg-thuy-800 border border-thuy-700 text-xs text-white"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-slate-300">Nhóm danh mục:</label>
                  <select
                    value={form.type}
                    onChange={(e) => updateForm({ type: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-thuy-800 border border-thuy-700 text-xs text-white"
                  >
                    {CATALOG_GROUPS.map((g) => (
                      <option key={g.key} value={g.types[0]}>
                        {g.label}
                      </option>
                    ))}
                    {PRODUCT_TYPE_LABELS.CAD && (
                      <option value="CAD">Bản vẽ CAD (chi tiết)</option>
                    )}
                    <option value="MODEL_3D">Model 3D (chi tiết)</option>
                    <option value="TEMPLATE">Template (chi tiết)</option>
                    <option value="DOCUMENT">Tài liệu (chi tiết)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs text-slate-300">Định dạng file:</label>
                  <input
                    type="text"
                    value={form.fileFormat}
                    onChange={(e) => updateForm({ fileFormat: e.target.value })}
                    placeholder="AutoCAD .DWG / 3ds Max 2024"
                    className="w-full px-3 py-2 rounded-xl bg-thuy-800 border border-thuy-700 text-xs text-white"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-slate-300">Dung lượng:</label>
                  <input
                    type="text"
                    value={form.fileSize}
                    onChange={(e) => updateForm({ fileSize: e.target.value })}
                    placeholder="185 MB / 1.2 GB"
                    className="w-full px-3 py-2 rounded-xl bg-thuy-800 border border-thuy-700 text-xs text-white"
                  />
                </div>
              </div>

              {/* File download configuration */}
              <div className="p-4 rounded-2xl bg-thuy-850/60 border border-thuy-750 space-y-3">
                <h4 className="text-xs font-bold text-thuy-300 flex items-center gap-2">
                  <Download className="w-4 h-4" /> File &amp; link tải cho khách đã thanh toán
                </h4>

                <div className="space-y-1">
                  <label className="text-xs text-slate-300">
                    Tải file trực tiếp lên kho private (tối đa 4MB):
                  </label>
                  <div className="flex items-center gap-2">
                    <label className="flex-1 flex items-center gap-2 px-3 py-2 rounded-xl bg-thuy-800 border border-thuy-700 text-xs text-slate-300 cursor-pointer hover:border-thuy-500">
                      <Upload className="w-3.5 h-3.5" />
                      <span className="truncate">
                        {form.fileName || "Chọn file (zip, dwg, skp, rar...)"}
                      </span>
                      <input
                        type="file"
                        className="hidden"
                        onChange={(e) => {
                          const f = e.target.files?.[0];
                          if (f) handleUploadFile(f);
                          e.target.value = "";
                        }}
                      />
                    </label>
                    {uploading && <Loader2 className="w-4 h-4 animate-spin text-thuy-400" />}
                  </div>
                  {form.fileKey && (
                    <p className="text-[10px] text-emerald-400 font-mono truncate">
                      Đang lưu: {form.fileKey}
                    </p>
                  )}
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-slate-300 flex items-center gap-1.5">
                    <Link2 className="w-3.5 h-3.5" /> Link tải nội bộ (Google Drive/Dropbox/CDN):
                  </label>
                  <input
                    type="url"
                    value={form.downloadLinkUrl}
                    onChange={(e) => updateForm({ downloadLinkUrl: e.target.value })}
                    placeholder="https://drive.google.com/... (dán link chia sẻ nội bộ)"
                    className="w-full px-3 py-2 rounded-xl bg-thuy-800 border border-thuy-700 text-xs text-white"
                  />
                  <p className="text-[10px] text-slate-500">
                    Link này KHÔNG được hiển thị cho khách. Máy chủ sẽ phát lại file qua
                    /api/downloads sau khi kiểm tra đúng tài khoản đã thanh toán.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs text-slate-300 flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5" /> Thời hạn link sau khi thanh toán:
                    </label>
                    <select
                      value={form.downloadExpiresMinutes}
                      onChange={(e) => updateForm({ downloadExpiresMinutes: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-thuy-800 border border-thuy-700 text-xs text-white"
                    >
                      {EXPIRY_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs text-slate-300">Dự án hiển thị liên kết:</label>
                    <select
                      value={form.projectId}
                      onChange={(e) => updateForm({ projectId: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-thuy-800 border border-thuy-700 text-xs text-white"
                    >
                      <option value="">— Không liên kết —</option>
                      {projects.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.title}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <label className="flex items-center gap-2 text-xs text-slate-300">
                  <input
                    type="checkbox"
                    checked={form.requiresPayment}
                    onChange={(e) => updateForm({ requiresPayment: e.target.checked })}
                    className="accent-thuy-400"
                  />
                  Bắt buộc thanh toán mới được tải (khuyến nghị bật)
                </label>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <label className="text-xs text-slate-300">Ảnh thumbnail (URL):</label>
                  <button
                    type="button"
                    onClick={() => setMediaPickerOpen(true)}
                    className="text-[10px] text-thuy-400 hover:underline"
                  >
                    Chọn từ Media Library
                  </button>
                </div>
                <input
                  type="url"
                  value={form.thumbnail}
                  onChange={(e) => updateForm({ thumbnail: e.target.value })}
                  placeholder="https://..."
                  className="w-full px-3 py-2 rounded-xl bg-thuy-800 border border-thuy-700 text-xs text-white"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs text-slate-300">Mô tả sản phẩm:</label>
                <textarea
                  rows={3}
                  value={form.description}
                  onChange={(e) => updateForm({ description: e.target.value })}
                  placeholder="Chi tiết các file đính kèm..."
                  className="w-full p-3 rounded-xl bg-thuy-800 border border-thuy-700 text-xs text-white"
                />
              </div>

              <div className="flex flex-wrap gap-4">
                <label className="flex items-center gap-2 text-xs text-slate-300">
                  <input
                    type="checkbox"
                    checked={form.active}
                    onChange={(e) => updateForm({ active: e.target.checked })}
                    className="accent-thuy-400"
                  />
                  Đang kinh doanh
                </label>
                <label className="flex items-center gap-2 text-xs text-slate-300">
                  <input
                    type="checkbox"
                    checked={form.featured}
                    onChange={(e) => updateForm({ featured: e.target.checked })}
                    className="accent-thuy-400"
                  />
                  Nổi bật
                </label>
              </div>

              <button
                type="submit"
                disabled={saving}
                className="w-full py-2.5 rounded-xl bg-thuy-400 text-thuy-950 font-bold text-xs uppercase hover:brightness-110 shadow-glow-cyan flex items-center justify-center gap-2"
              >
                {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                <span>Lưu mục danh mục</span>
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Media Picker */}
      <MediaPickerModal
        isOpen={mediaPickerOpen}
        onClose={() => setMediaPickerOpen(false)}
        onSelect={(selected) => {
          if (!Array.isArray(selected)) {
            updateForm({ thumbnail: selected.url });
          }
        }}
        multiple={false}
        title="Chọn ảnh thumbnail từ Media Library"
      />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Bảng danh mục của 1 nhóm                                            */
/* ------------------------------------------------------------------ */
function CatalogTable({
  items,
  groupKey,
  onEdit,
  onDelete,
}: {
  items: any[];
  groupKey: string;
  onEdit: (item: any) => void;
  onDelete: (id: string, name: string) => void;
}) {
  const group = CATALOG_GROUPS.find((g) => g.key === groupKey);

  if (items.length === 0) {
    return (
      <div className="py-16 text-center text-slate-400 text-xs rounded-2xl bg-thuy-850/50 border border-thuy-750">
        <Package className="w-8 h-8 mx-auto mb-3 text-slate-600" />
        Nhóm <b className="text-white">{group?.label}</b> chưa có mục nào. Bấm “+ Thêm mục” để
        tạo mục danh mục đầu tiên.
      </div>
    );
  }

  return (
    <div className="rounded-2xl bg-thuy-850 border border-thuy-750 overflow-hidden shadow-xl">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-thuy-900/80 text-slate-400 uppercase font-semibold text-[10px] tracking-wider border-b border-thuy-750">
            <tr>
              <th className="py-3 px-5">Ảnh</th>
              <th className="py-3 px-5">Tên mục</th>
              <th className="py-3 px-5">Giá bán</th>
              <th className="py-3 px-5">File / Link tải</th>
              <th className="py-3 px-5">Hiệu lực link</th>
              <th className="py-3 px-5">Trạng thái</th>
              <th className="py-3 px-5 text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-thuy-750/60">
            {items.map((p) => (
              <tr key={p.id} className="hover:bg-thuy-800/40">
                <td className="py-3.5 px-5">
                  <div className="relative w-14 h-14 rounded-lg overflow-hidden bg-thuy-950 border border-thuy-700">
                    {p.thumbnail ? (
                      <Image
                        src={p.thumbnail}
                        alt={p.name}
                        fill
                        className="object-cover"
                        unoptimized
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-600">
                        <FileCode className="w-4 h-4" />
                      </div>
                    )}
                  </div>
                </td>
                <td className="py-3.5 px-5">
                  <span className="font-bold text-white block text-sm">{p.name}</span>
                  <span className="text-[10px] text-slate-400 font-mono block">
                    /products/{p.slug}
                  </span>
                  <span className="text-[10px] text-thuy-300 mt-1 inline-block px-2 py-0.5 rounded-full bg-thuy-800 border border-thuy-700">
                    {PRODUCT_TYPE_LABELS[p.type] || p.type}
                  </span>
                  {p.project && (
                    <span className="text-[10px] text-slate-400 block mt-1">
                      Dự án: {p.project.title}
                    </span>
                  )}
                </td>
                <td className="py-3.5 px-5 font-bold text-thuy-400 text-sm">
                  {formatVND(p.price)}
                </td>
                <td className="py-3.5 px-5 text-slate-300">
                  {p.fileKey || p.downloadLinkUrl ? (
                    <>
                      <div className="flex items-center gap-1.5 text-emerald-400 font-semibold">
                        <Check className="w-3.5 h-3.5" /> Đã cấu hình
                      </div>
                      <span className="text-[10px] text-slate-400 font-mono block truncate max-w-[220px]">
                        {p.fileName || p.fileKey || "Link nội bộ"}
                      </span>
                      <span className="text-[10px] text-slate-500">
                        {p.fileSize || p.fileFormat || "—"}
                      </span>
                    </>
                  ) : (
                    <span className="text-amber-400 text-[11px]">
                      Chưa có file — khách mua sẽ không tải được
                    </span>
                  )}
                </td>
                <td className="py-3.5 px-5 text-slate-300">
                  {p.downloadExpiresMinutes || 5} phút
                </td>
                <td className="py-3.5 px-5">
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                      p.active
                        ? "bg-emerald-500/10 text-emerald-300 border-emerald-500/30"
                        : "bg-thuy-800 text-slate-400 border-thuy-700"
                    }`}
                  >
                    {p.active ? "Đang bán" : "Đang ẩn"}
                  </span>
                </td>
                <td className="py-3.5 px-5 text-right">
                  <div className="inline-flex gap-1.5">
                    <button
                      onClick={() => onEdit(p)}
                      className="p-1.5 rounded-lg bg-thuy-800 hover:bg-thuy-700 text-slate-300 border border-thuy-700"
                      title="Sửa"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onDelete(p.id, p.name)}
                      className="p-1.5 rounded-lg bg-thuy-800 hover:bg-red-950 hover:text-red-400 text-slate-400 border border-thuy-700"
                      title="Xoá"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Tab quản lý danh mục dự án + dự án hiển thị                        */
/* ------------------------------------------------------------------ */
function ManagePanel({
  categories,
  projects,
  items,
  onRefresh,
  onNotice,
}: {
  categories: any[];
  projects: any[];
  items: any[];
  onRefresh: () => void;
  onNotice: (n: { type: "ok" | "err"; text: string }) => void;
}) {
  const [catName, setCatName] = useState("");
  const [catDesc, setCatDesc] = useState("");
  const [savingCat, setSavingCat] = useState(false);

  const createCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!catName.trim()) return;
    setSavingCat(true);
    try {
      const res = await fetch("/api/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: catName, description: catDesc }),
      });
      const data = await res.json();
      if (data.success) {
        setCatName("");
        setCatDesc("");
        onNotice({ type: "ok", text: "Đã thêm danh mục dự án." });
        onRefresh();
      } else {
        onNotice({ type: "err", text: data.error || "Không thêm được." });
      }
    } finally {
      setSavingCat(false);
    }
  };

  const deleteCategory = async (id: string, name: string) => {
    if (!confirm(`Xoá danh mục "${name}"?`)) return;
    const res = await fetch(`/api/categories/${id}`, { method: "DELETE" });
    const data = await res.json();
    onNotice(
      data.success
        ? { type: "ok", text: "Đã xoá danh mục." }
        : { type: "err", text: data.error || "Không xoá được." }
    );
    if (data.success) onRefresh();
  };

  return (
    <div className="space-y-6">
      {/* Danh mục dự án */}
      <div className="rounded-2xl bg-thuy-850 border border-thuy-750 overflow-hidden shadow-xl">
        <div className="px-5 py-4 border-b border-thuy-750 flex items-center justify-between">
          <h2 className="font-bold text-sm text-white flex items-center gap-2">
            <FolderTree className="w-4 h-4 text-thuy-400" /> Danh Mục Dự Án Hiển Thị
          </h2>
          <span className="text-[10px] text-slate-400">
            Phân loại dự án trên website (biệt thự, nhà phố, nội thất...)
          </span>
        </div>

        <form
          onSubmit={createCategory}
          className="px-5 py-4 grid grid-cols-1 sm:grid-cols-[1fr_2fr_auto] gap-3 border-b border-thuy-750/60 bg-thuy-900/40"
        >
          <input
            value={catName}
            onChange={(e) => setCatName(e.target.value)}
            placeholder="Tên danh mục *"
            className="px-3 py-2 rounded-xl bg-thuy-800 border border-thuy-700 text-xs text-white"
          />
          <input
            value={catDesc}
            onChange={(e) => setCatDesc(e.target.value)}
            placeholder="Mô tả ngắn"
            className="px-3 py-2 rounded-xl bg-thuy-800 border border-thuy-700 text-xs text-white"
          />
          <button
            type="submit"
            disabled={savingCat}
            className="px-4 py-2 rounded-xl bg-thuy-400 text-thuy-950 font-bold text-xs uppercase hover:brightness-110 flex items-center gap-1.5 justify-center"
          >
            {savingCat ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Plus className="w-3.5 h-3.5" />
            )}
            Thêm
          </button>
        </form>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-thuy-900/80 text-slate-400 uppercase font-semibold text-[10px] tracking-wider border-b border-thuy-750">
              <tr>
                <th className="py-3 px-5">Tên danh mục</th>
                <th className="py-3 px-5">Slug</th>
                <th className="py-3 px-5">Số dự án</th>
                <th className="py-3 px-5 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-thuy-750/60">
              {categories.map((c) => (
                <tr key={c.id} className="hover:bg-thuy-800/40">
                  <td className="py-3 px-5 font-bold text-white">{c.name}</td>
                  <td className="py-3 px-5 text-slate-400 font-mono text-[10px]">
                    {c.slug}
                  </td>
                  <td className="py-3 px-5 text-slate-300">
                    {c._count?.projects ?? 0}
                  </td>
                  <td className="py-3 px-5 text-right">
                    <button
                      onClick={() => deleteCategory(c.id, c.name)}
                      className="p-1.5 rounded-lg bg-thuy-800 hover:bg-red-950 hover:text-red-400 text-slate-400 border border-thuy-700"
                      title="Xoá"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
              {categories.length === 0 && (
                <tr>
                  <td colSpan={4} className="py-6 text-center text-slate-500 text-xs">
                    Chưa có danh mục dự án nào.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Dự án hiển thị */}
      <div className="rounded-2xl bg-thuy-850 border border-thuy-750 overflow-hidden shadow-xl">
        <div className="px-5 py-4 border-b border-thuy-750 flex items-center justify-between">
          <h2 className="font-bold text-sm text-white flex items-center gap-2">
            <Building2 className="w-4 h-4 text-thuy-400" /> Dự Án Kiến Trúc Hiển Thị
          </h2>
          <Link
            href="/admin/projects/new"
            className="px-3 py-1.5 rounded-lg bg-thuy-800 hover:bg-thuy-750 text-thuy-300 text-[10px] font-bold uppercase border border-thuy-700 flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" /> Tạo dự án
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-thuy-900/80 text-slate-400 uppercase font-semibold text-[10px] tracking-wider border-b border-thuy-750">
              <tr>
                <th className="py-3 px-5">Ảnh</th>
                <th className="py-3 px-5">Tên dự án</th>
                <th className="py-3 px-5">Danh mục</th>
                <th className="py-3 px-5">Mục danh mục đã bán</th>
                <th className="py-3 px-5 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-thuy-750/60">
              {projects.map((p) => {
                const linked = items.filter((i) => i.projectId === p.id);
                return (
                  <tr key={p.id} className="hover:bg-thuy-800/40">
                    <td className="py-3 px-5">
                      <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-thuy-950 border border-thuy-700">
                        {p.cover?.url ? (
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
                    <td className="py-3 px-5">
                      <span className="font-bold text-white block">{p.title}</span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        /projects/{p.slug}
                      </span>
                    </td>
                    <td className="py-3 px-5 text-slate-300">
                      {p.category?.name || "—"}
                    </td>
                    <td className="py-3 px-5">
                      {linked.length === 0 ? (
                        <span className="text-[10px] text-slate-500">Chưa gắn mục bán</span>
                      ) : (
                        linked.map((l) => (
                          <span
                            key={l.id}
                            className="inline-block mr-1.5 px-2 py-0.5 rounded-full bg-thuy-800 text-thuy-300 text-[10px] font-bold border border-thuy-700"
                          >
                            {l.name}
                          </span>
                        ))
                      )}
                    </td>
                    <td className="py-3 px-5 text-right">
                      <Link
                        href={`/admin/projects/${p.id}`}
                        className="inline-block p-1.5 rounded-lg bg-thuy-800 hover:bg-thuy-700 text-slate-300 border border-thuy-700"
                        title="Sửa dự án"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </Link>
                    </td>
                  </tr>
                );
              })}
              {projects.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-6 text-center text-slate-500 text-xs">
                    Chưa có dự án nào.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

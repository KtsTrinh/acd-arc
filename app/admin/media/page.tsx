"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import {
  Upload,
  Link as LinkIcon,
  Search,
  Folder,
  Trash2,
  Edit2,
  X,
  Check,
  Loader2,
  Maximize2,
  Copy,
} from "lucide-react";

export default function AdminMediaPage() {
  const [mediaList, setMediaList] = useState<any[]>([]);
  const [folders, setFolders] = useState<string[]>([]);
  const [selectedFolder, setSelectedFolder] = useState<string>("all");
  const [search, setSearch] = useState<string>("");
  const [loading, setLoading] = useState(false);

  // Upload state
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadFolder, setUploadFolder] = useState("general");
  const [uploadAlt, setUploadAlt] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  // Pinterest URL import state
  const [urlModalOpen, setUrlModalOpen] = useState(false);
  const [importUrl, setImportUrl] = useState("");
  const [importFilename, setImportFilename] = useState("");
  const [importFolder, setImportFolder] = useState("pinterest");
  const [importAlt, setImportAlt] = useState("");
  const [isImporting, setIsImporting] = useState(false);
  const [previewImages, setPreviewImages] = useState<any[]>([]);
  const [loadingPreview, setLoadingPreview] = useState(false)

  // Edit metadata modal
  const [editingItem, setEditingItem] = useState<any | null>(null);
  const [editFilename, setEditFilename] = useState("");
  const [editAlt, setEditAlt] = useState("");
  const [editFolder, setEditFolder] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);

  const fetchMedia = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedFolder !== "all") params.set("folder", selectedFolder);
      if (search) params.set("search", search);

      const res = await fetch(`/api/media?${params.toString()}`);
      const data = await res.json();
      if (data.media) {
        setMediaList(data.media);
        setFolders(data.folders || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMedia();
  }, [selectedFolder, search]);

  // Handle Physical Upload
  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadFile) return;

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", uploadFile);
      formData.append("folder", uploadFolder);
      formData.append("alt", uploadAlt);

      const res = await fetch("/api/media", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();

      if (data.media) {
        setUploadModalOpen(false);
        setUploadFile(null);
        setUploadAlt("");
        fetchMedia();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsUploading(false);
    }
  };

  // Handle Pinterest / CDN Import
  const handleUrlSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!importUrl) return;

    setIsImporting(true);
    try {
      const res = await fetch("/api/media", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url: importUrl,
          filename: importFilename,
          folder: importFolder,
          alt: importAlt,
        }),
      });
      const data = await res.json();

      if (data.media) {
        setUrlModalOpen(false);
        setImportUrl("");
        setImportFilename("");
        setImportAlt("");
        fetchMedia();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsImporting(false);
    }
  };

  // Handle Metadata Update (Filename & Alt rename)
  const handleUpdateMetadata = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;

    setIsUpdating(true);
    try {
      const res = await fetch(`/api/media/${editingItem.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          filename: editFilename,
          alt: editAlt,
          folder: editFolder,
        }),
      });
      const data = await res.json();

      if (data.media) {
        setEditingItem(null);
        fetchMedia();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Bạn có chắc chắn muốn xóa hình ảnh này khỏi Media Library?")) return;

    try {
      const res = await fetch(`/api/media/${id}`, { method: "DELETE" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        alert(data.error || "Không thể xóa media.");
        window.location.reload();
        return;
      }
      window.location.reload();
    } catch (err) {
      console.error(err);
      alert("Không thể xóa media.");
      window.location.reload();
    }
  };

  return (
    <div className="space-y-6">
      {/* Header and Action Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display font-bold text-2xl sm:text-3xl text-white">
            Media Library Dùng Chung
          </h1>
          <p className="text-xs text-slate-600">
            Kho ảnh tập trung cho toàn bộ hệ thống. Đổi tên ảnh hoặc sửa mô tả sẽ tự động đồng bộ mọi
            dự án đang sử dụng.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setUploadModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-thuy-400 text-thuy-950 font-bold text-xs hover:brightness-110 shadow-glow-cyan transition-all"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Upload File Ảnh</span>
          </button>

          <button
            onClick={() => setUrlModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-thuy-850 text-slate-200 hover:text-white hover:bg-thuy-800 border border-thuy-700 text-xs font-semibold transition-all"
          >
            <LinkIcon className="w-3.5 h-3.5 text-thuy-400" />
            <span>Thêm Ảnh/Video</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-thuy-850 border border-thuy-750 flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          <button
            onClick={() => setSelectedFolder("all")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${selectedFolder === "all"
              ? "bg-thuy-400 text-thuy-950 shadow-glow-cyan"
              : "bg-thuy-900 text-slate-600 hover:text-white border border-thuy-750"
              }`}
          >
            Tất cả ({mediaList.length})
          </button>
          {folders.map((f) => (
            <button
              key={f}
              onClick={() => setSelectedFolder(f)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap capitalize transition-all ${selectedFolder === f
                ? "bg-thuy-400 text-thuy-950 shadow-glow-cyan"
                : "bg-thuy-900 text-slate-600 hover:text-white border border-thuy-750"
                }`}
            >
              <Folder className="w-3.5 h-3.5" />
              <span>{f}</span>
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-600" />
          <input
            type="text"
            placeholder="Tìm theo tên file, alt..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-xl bg-thuy-900 border border-thuy-700 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-thuy-400"
          />
        </div>
      </div>

      {/* Media Grid */}
      <div className="space-y-4">
        {loading ? (
          <div className="flex items-center justify-center py-24 text-slate-600 gap-2">
            <Loader2 className="w-5 h-5 animate-spin text-thuy-400" />
            <span>Đang tải thư viện media...</span>
          </div>
        ) : mediaList.length === 0 ? (
          <div className="text-center py-20 rounded-2xl bg-thuy-850/50 border border-thuy-800 text-xs text-slate-600">
            Không tìm thấy hình ảnh nào. Nhấn Upload hoặc Thêm từ Pinterest ở trên.
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {mediaList.map((item) => (
              <div
                key={item.id}
                className="group relative aspect-square rounded-2xl overflow-hidden bg-thuy-950 border border-thuy-750 hover:border-thuy-400 transition-all duration-300 hover:shadow-card-dark flex flex-col justify-end"
              >
                <Image
                  src={item.url}
                  alt={item.alt || item.filename}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                  unoptimized
                />

                {/* Folder pill */}
                <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-thuy-950/80 backdrop-blur-md text-[10px] text-thuy-300 border border-thuy-700 capitalize">
                  {item.folder}
                </div>

                {/* Action buttons overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-thuy-950 via-thuy-950/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-3 flex flex-col justify-between">
                  <div className="flex justify-end gap-1.5">
                    <button
                      onClick={() => {
                        setEditingItem(item);
                        setEditFilename(item.filename);
                        setEditAlt(item.alt || "");
                        setEditFolder(item.folder);
                      }}
                      className="p-1.5 rounded-lg bg-thuy-800 hover:bg-thuy-700 text-slate-200 border border-thuy-700"
                      title="Đổi tên / Sửa thông tin"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="p-1.5 rounded-lg bg-thuy-800 hover:bg-red-950 hover:text-red-400 text-slate-600 border border-thuy-700"
                      title="Xóa media"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="space-y-0.5">
                    <p className="font-medium text-[11px] text-white truncate leading-snug">
                      {item.filename}
                    </p>
                    <p className="text-[10px] text-slate-600 truncate">{item.alt}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal 1: Upload Local File */}
      {uploadModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-thuy-950/80 backdrop-blur-sm" onClick={() => setUploadModalOpen(false)} />
          <div className="relative z-10 w-full max-w-md bg-thuy-900 border border-thuy-700 rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-thuy-750">
              <h3 className="font-semibold text-base text-white">Upload File Ảnh Vật Lý</h3>
              <button onClick={() => setUploadModalOpen(false)} className="text-slate-600 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUploadSubmit} className="space-y-4">
              <div className="border-2 border-dashed border-thuy-700 rounded-xl p-6 text-center cursor-pointer bg-thuy-850">
                <input
                  type="file"
                  id="admin-upload-file"
                  className="hidden"
                  accept="image/*"
                  onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
                />
                <label htmlFor="admin-upload-file" className="cursor-pointer space-y-2 block">
                  <Upload className="w-8 h-8 mx-auto text-thuy-400" />
                  <p className="text-xs text-white font-medium">
                    {uploadFile ? uploadFile.name : "Nhấn để chọn ảnh từ máy tính"}
                  </p>
                  <span className="text-[10px] text-slate-600 block">Lưu trữ vào /public/uploads/</span>
                </label>
              </div>

              <div className="space-y-1">
                <label className="text-xs text-slate-700">Thư mục:</label>
                <input
                  type="text"
                  value={uploadFolder}
                  onChange={(e) => setUploadFolder(e.target.value)}
                  placeholder="villa, townhouse, interior..."
                  className="w-full px-3 py-2 rounded-lg bg-thuy-800 border border-thuy-700 text-xs text-white"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs text-slate-700">Mô tả ảnh (Alt):</label>
                <input
                  type="text"
                  value={uploadAlt}
                  onChange={(e) => setUploadAlt(e.target.value)}
                  placeholder="Mô tả chuẩn SEO..."
                  className="w-full px-3 py-2 rounded-lg bg-thuy-800 border border-thuy-700 text-xs text-white"
                />
              </div>

              <button
                type="submit"
                disabled={!uploadFile || isUploading}
                className="w-full py-2.5 rounded-xl bg-thuy-400 text-thuy-950 font-bold text-xs uppercase hover:brightness-110 disabled:opacity-50 flex items-center justify-center gap-2 shadow-glow-cyan"
              >
                {isUploading && <Loader2 className="w-4 h-4 animate-spin" />}
                <span>{isUploading ? "Đang upload..." : "Lưu Ảnh"}</span>
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Modal 2: Import Pinterest / CDN Link */}
      {urlModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-thuy-950/80 backdrop-blur-sm" onClick={() => setUrlModalOpen(false)} />
          <div className="relative z-10 w-full max-w-lg bg-thuy-900 border border-thuy-700 rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-thuy-750">
              <h3 className="font-semibold text-base text-white">Thêm Ảnh/Video Từ Link</h3>
              <button onClick={() => setUrlModalOpen(false)} className="text-slate-600 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUrlSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs text-slate-700">Đường dẫn ảnh trực tiếp (URL) hoặc Link Thư Mục Drive:</label>
                <input
                  type="url"
                  required
                  placeholder="Dán link ảnh Pinterest, Unsplash hoặc đường dẫn thư mục Google Drive..."
                  value={importUrl}
                  onChange={(e) => setImportUrl(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-thuy-800 border border-thuy-700 text-xs text-white"
                />
              </div>

              {/* Khung xử lý Preview thông minh */}
              {importUrl && (
                <div className="relative w-full h-40 rounded-xl overflow-hidden border border-thuy-750 bg-thuy-950 flex flex-col justify-center">
                  {importUrl.includes("/folders/") || importUrl.includes("://google.com") ? (
                    // NẾU LÀ LINK THƯ MỤC DRIVE: Hiển thị trạng thái quét hoặc danh sách ảnh thu nhỏ
                    loadingPreview ? (
                      <div className="flex flex-col items-center justify-center gap-2 text-slate-600 text-xs">
                        <Loader2 className="w-5 h-5 animate-spin text-cyan-400" />
                        <span>Đang quét danh sách ảnh trong thư mục...</span>
                      </div>
                    ) : previewImages.length > 0 ? (
                      // Nếu đã quét xong ngầm, render lưới ảnh nhỏ để admin biết thư mục có bao nhiêu ảnh
                      <div className="p-3 h-full flex flex-col justify-between">
                        <div className="grid grid-cols-5 gap-2 overflow-y-auto max-h-[100px] p-0.5">
                          {previewImages.map((img, idx) => (
                            <div key={idx} className="relative aspect-square rounded-lg overflow-hidden border border-thuy-700 bg-thuy-900">
                              <img src={`https://google.com{img.id}`} alt="preview-item" className="w-full h-full object-cover" />
                            </div>
                          ))}
                        </div>
                        <div className="text-[10px] text-emerald-400 font-medium flex items-center gap-1.5 mt-2 bg-emerald-500/5 p-2 rounded-lg border border-emerald-500/10">
                          <Folder className="w-3.5 h-3.5" />
                          <span>Đã nhận diện & quét thành công {previewImages.length} ảnh từ Google Drive. Sẵn sàng lưu!</span>
                        </div>
                      </div>
                    ) : (
                      <div className="p-4 text-center space-y-1">
                        <div className="w-7 h-7 rounded-full bg-red-500/10 flex items-center justify-center mx-auto">
                          <X className="w-3.5 h-3.5 text-red-400" />
                        </div>
                        <p className="text-xs text-white font-medium">Không thể quét dữ liệu xem trước</p>
                        <span className="text-[10px] text-slate-500 block">Hãy đảm bảo thư mục Drive đã bật chế độ công khai (Anyone with the link).</span>
                      </div>
                    )
                  ) : (
                    // NẾU LÀ LINK FILE ẢNH ĐƠN LẺ: Tự động dùng cổng uc?export=view để hiển thị mượt mà
                    (() => {
                      let computedSrc = importUrl;
                      const driveMatch = importUrl.match(/\/d\/([a-zA-Z0-9_-]+)/);
                      if (driveMatch) {
                        computedSrc = `https://google.com{driveMatch[1]}`;
                      }
                      return (
                        <Image src={computedSrc} alt="Preview" fill className="object-cover" unoptimized />
                      );
                    })()
                  )}
                </div>
              )}

              <div className="space-y-1">
                <label className="text-xs text-slate-700">Tên file nhận diện:</label>
                <input
                  type="text"
                  value={importFilename}
                  onChange={(e) => setImportFilename(e.target.value)}
                  placeholder="villa-facade.jpg"
                  className="w-full px-3 py-2 rounded-lg bg-thuy-800 border border-thuy-700 text-xs text-white"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs text-slate-700">Thư mục:</label>
                <input
                  type="text"
                  value={importFolder}
                  onChange={(e) => setImportFolder(e.target.value)}
                  placeholder="villa, townhouse, interior..."
                  className="w-full px-3 py-2 rounded-lg bg-thuy-800 border border-thuy-700 text-xs text-white"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs text-slate-700">Mô tả ảnh (Alt):</label>
                <input
                  type="text"
                  value={importAlt}
                  onChange={(e) => setImportAlt(e.target.value)}
                  placeholder="Biệt thự phong cách..."
                  className="w-full px-3 py-2 rounded-lg bg-thuy-800 border border-thuy-700 text-xs text-white"
                />
              </div>

              <button
                type="submit"
                disabled={!importUrl || isImporting || loadingPreview}
                className="w-full py-2.5 rounded-xl bg-thuy-400 text-thuy-950 font-bold text-xs uppercase hover:brightness-110 disabled:opacity-50 flex items-center justify-center gap-2 shadow-glow-cyan"
              >
                {isImporting && <Loader2 className="w-4 h-4 animate-spin" />}
                <span>
                  {isImporting
                    ? "Đang lưu dữ liệu vào hệ thống..."
                    : (importUrl.includes("/folders/") || importUrl.includes("://google.com")
                      ? `Import Hàng Loạt ${previewImages.length > 0 ? `(${previewImages.length} ảnh)` : ""}`
                      : "Thêm Vào Thư Viện"
                    )
                  }
                </span>
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Modal 3: Edit Metadata / Rename File */}
      {editingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-thuy-950/80 backdrop-blur-sm" onClick={() => setEditingItem(null)} />
          <div className="relative z-10 w-full max-w-md bg-thuy-900 border border-thuy-700 rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-thuy-750">
              <h3 className="font-semibold text-base text-white">Đổi Tên & Sửa Metadata Media</h3>
              <button onClick={() => setEditingItem(null)} className="text-slate-600 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateMetadata} className="space-y-4">
              <div className="relative w-full h-36 rounded-xl overflow-hidden border border-thuy-750 bg-thuy-950">
                <Image src={editingItem.url} alt="Editing preview" fill className="object-cover" unoptimized />
              </div>

              <div className="space-y-1">
                <label className="text-xs text-slate-700">Tên file (Filename):</label>
                <input
                  type="text"
                  required
                  value={editFilename}
                  onChange={(e) => setEditFilename(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-thuy-800 border border-thuy-700 text-xs text-white"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs text-slate-700">Thư mục (Folder):</label>
                <input
                  type="text"
                  value={editFolder}
                  onChange={(e) => setEditFolder(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-thuy-800 border border-thuy-700 text-xs text-white"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs text-slate-700">Mô tả hiển thị (Alt text):</label>
                <input
                  type="text"
                  value={editAlt}
                  onChange={(e) => setEditAlt(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-thuy-800 border border-thuy-700 text-xs text-white"
                />
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setEditingItem(null)}
                  className="flex-1 py-2 rounded-xl bg-thuy-800 text-xs font-semibold text-slate-700 border border-thuy-700 hover:bg-thuy-750"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={isUpdating}
                  className="flex-1 py-2 rounded-xl bg-thuy-400 text-thuy-950 font-bold text-xs hover:brightness-110 shadow-glow-cyan flex items-center justify-center gap-1.5"
                >
                  {isUpdating && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>Lưu Thay Đổi</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}


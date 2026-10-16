"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { X, Upload, Link as LinkIcon, Search, Check, Folder, Loader2 } from "lucide-react";

export interface MediaItem {
  id: string;
  filename: string;
  originalName: string | null;
  url: string;
  folder: string;
  alt: string | null;
  width?: number | null;
  height?: number | null;
}

interface MediaPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (media: MediaItem | MediaItem[]) => void;
  multiple?: boolean;
  selectedIds?: string[];
  title?: string;
}

export default function MediaPickerModal({
  isOpen,
  onClose,
  onSelect,
  multiple = false,
  selectedIds = [],
  title = "Chọn từ Media Library",
}: MediaPickerModalProps) {
  const [activeTab, setActiveTab] = useState<"library" | "upload" | "url">("library");
  const [mediaList, setMediaList] = useState<MediaItem[]>([]);
  const [folders, setFolders] = useState<string[]>([]);
  const [selectedFolder, setSelectedFolder] = useState<string>("all");
  const [search, setSearch] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [selectedItems, setSelectedItems] = useState<MediaItem[]>([]);

  // Form states for Upload
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadFolder, setUploadFolder] = useState("general");
  const [uploadAlt, setUploadAlt] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  // Form states for External URL (Pinterest / CDN)
  const [externalUrl, setExternalUrl] = useState("");
  const [externalFilename, setExternalFilename] = useState("");
  const [externalFolder, setExternalFolder] = useState("pinterest");
  const [externalAlt, setExternalAlt] = useState("");
  const [isImporting, setIsImporting] = useState(false);

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
      console.error("Error loading media:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchMedia();
    }
  }, [isOpen, selectedFolder, search]);

  if (!isOpen) return null;

  const toggleSelect = (item: MediaItem) => {
    if (!multiple) {
      onSelect(item);
      onClose();
      return;
    }

    if (selectedItems.some((i) => i.id === item.id)) {
      setSelectedItems(selectedItems.filter((i) => i.id !== item.id));
    } else {
      setSelectedItems([...selectedItems, item]);
    }
  };

  const handleConfirmMultiple = () => {
    onSelect(selectedItems);
    onClose();
  };

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
        setUploadFile(null);
        setUploadAlt("");
        setActiveTab("library");
        await fetchMedia();
        if (!multiple) {
          onSelect(data.media);
          onClose();
        }
      }
    } catch (err) {
      console.error("Upload error:", err);
    } finally {
      setIsUploading(false);
    }
  };

  // Handle External Pinterest/CDN URL
  const handleUrlSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!externalUrl) return;

    setIsImporting(true);
    try {
      const res = await fetch("/api/media", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url: externalUrl,
          filename: externalFilename,
          folder: externalFolder,
          alt: externalAlt,
        }),
      });
      const data = await res.json();

      if (data.media) {
        setExternalUrl("");
        setExternalFilename("");
        setExternalAlt("");
        setActiveTab("library");
        await fetchMedia();
        if (!multiple) {
          onSelect(data.media);
          onClose();
        }
      }
    } catch (err) {
      console.error("Import error:", err);
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-thuy-950/80 backdrop-blur-md" onClick={onClose} />

      <div className="relative z-10 w-full max-w-4xl h-[85vh] bg-thuy-900 border border-thuy-700 rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-5 border-b border-thuy-700 flex items-center justify-between bg-thuy-850">
          <div>
            <h3 className="font-semibold text-lg text-white">{title}</h3>
            <p className="text-xs text-slate-400">
              {multiple
                ? "Chọn một hoặc nhiều ảnh, sau đó nhấn xác nhận"
                : "Nhấn vào ảnh để chọn làm hình ảnh đại diện"}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex bg-thuy-950 p-1 rounded-xl border border-thuy-700">
              <button
                onClick={() => setActiveTab("library")}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  activeTab === "library"
                    ? "bg-thuy-400 text-thuy-950 font-bold"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                Thư Viện
              </button>
              <button
                onClick={() => setActiveTab("upload")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  activeTab === "upload"
                    ? "bg-thuy-400 text-thuy-950 font-bold"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Upload File</span>
              </button>
              <button
                onClick={() => setActiveTab("url")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  activeTab === "url"
                    ? "bg-thuy-400 text-thuy-950 font-bold"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <LinkIcon className="w-3.5 h-3.5" />
                <span>Pinterest / Link URL</span>
              </button>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-thuy-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab 1: Media Library Explorer */}
        {activeTab === "library" && (
          <div className="flex-1 flex flex-col overflow-hidden p-5 space-y-4">
            {/* Filter and Search Bar */}
            <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
              <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
                <button
                  onClick={() => setSelectedFolder("all")}
                  className={`px-3 py-1 rounded-lg text-xs whitespace-nowrap transition-all ${
                    selectedFolder === "all"
                      ? "bg-thuy-400 text-thuy-950 font-bold"
                      : "bg-thuy-800 text-slate-300 hover:bg-thuy-700"
                  }`}
                >
                  Tất cả thư mục
                </button>
                {folders.map((f) => (
                  <button
                    key={f}
                    onClick={() => setSelectedFolder(f)}
                    className={`flex items-center gap-1 px-3 py-1 rounded-lg text-xs whitespace-nowrap transition-all capitalize ${
                      selectedFolder === f
                        ? "bg-thuy-400 text-thuy-950 font-bold"
                        : "bg-thuy-800 text-slate-300 hover:bg-thuy-700"
                    }`}
                  >
                    <Folder className="w-3 h-3" />
                    <span>{f}</span>
                  </button>
                ))}
              </div>

              <div className="relative w-full sm:w-64">
                <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Tìm theo tên ảnh..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-thuy-800 border border-thuy-700 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-thuy-400"
                />
              </div>
            </div>

            {/* Media Grid */}
            <div className="flex-1 overflow-y-auto grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 p-1">
              {loading ? (
                <div className="col-span-full flex items-center justify-center py-20 text-slate-400 gap-2">
                  <Loader2 className="w-5 h-5 animate-spin text-thuy-400" />
                  <span>Đang tải thư viện ảnh...</span>
                </div>
              ) : mediaList.length === 0 ? (
                <div className="col-span-full text-center py-20 text-slate-400 text-xs">
                  Không tìm thấy hình ảnh nào phù hợp.
                </div>
              ) : (
                mediaList.map((item) => {
                  const isSelected = multiple
                    ? selectedItems.some((i) => i.id === item.id)
                    : selectedIds.includes(item.id);

                  return (
                    <div
                      key={item.id}
                      onClick={() => toggleSelect(item)}
                      className={`group relative aspect-square rounded-xl overflow-hidden cursor-pointer border-2 transition-all ${
                        isSelected
                          ? "border-thuy-400 ring-2 ring-thuy-400/30 scale-[0.98]"
                          : "border-thuy-750 hover:border-thuy-500"
                      }`}
                    >
                      <Image
                        src={item.url}
                        alt={item.alt || item.filename}
                        fill
                        className="object-cover"
                        unoptimized
                      />

                      {/* Selected check badge */}
                      {isSelected && (
                        <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-thuy-400 text-thuy-950 flex items-center justify-center font-bold shadow-md">
                          <Check className="w-4 h-4" />
                        </div>
                      )}

                      {/* Hover Info */}
                      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-thuy-950/95 via-thuy-950/60 to-transparent p-2 text-[11px] text-slate-200 truncate opacity-0 group-hover:opacity-100 transition-opacity">
                        {item.filename}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* Tab 2: Upload Local Physical File */}
        {activeTab === "upload" && (
          <form
            onSubmit={handleUploadSubmit}
            className="flex-1 p-8 flex flex-col justify-center max-w-lg mx-auto w-full space-y-4"
          >
            <div className="border-2 border-dashed border-thuy-700 hover:border-thuy-400 rounded-2xl p-8 text-center cursor-pointer bg-thuy-850/50">
              <input
                type="file"
                id="file-upload"
                className="hidden"
                accept="image/*"
                onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
              />
              <label htmlFor="file-upload" className="cursor-pointer space-y-3 block">
                <div className="w-12 h-12 mx-auto rounded-full bg-thuy-800 flex items-center justify-center text-thuy-400">
                  <Upload className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm font-medium text-white">
                    {uploadFile ? uploadFile.name : "Nhấn để chọn file ảnh từ máy tính"}
                  </p>
                  <p className="text-xs text-slate-400 mt-1">PNG, JPG, WEBP lên đến 20MB</p>
                </div>
              </label>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs text-slate-300 block mb-1">Thư mục phân loại:</label>
                <input
                  type="text"
                  value={uploadFolder}
                  onChange={(e) => setUploadFolder(e.target.value)}
                  placeholder="villa, townhouse, interior..."
                  className="w-full px-3 py-2 rounded-lg bg-thuy-800 border border-thuy-700 text-xs text-white"
                />
              </div>

              <div>
                <label className="text-xs text-slate-300 block mb-1">Mô tả ảnh (Alt SEO):</label>
                <input
                  type="text"
                  value={uploadAlt}
                  onChange={(e) => setUploadAlt(e.target.value)}
                  placeholder="Ví dụ: Phối cảnh phòng khách biệt thự..."
                  className="w-full px-3 py-2 rounded-lg bg-thuy-800 border border-thuy-700 text-xs text-white"
                />
              </div>

              <button
                type="submit"
                disabled={!uploadFile || isUploading}
                className="w-full py-2.5 rounded-xl bg-thuy-400 text-thuy-950 font-bold text-xs hover:brightness-110 disabled:opacity-50 flex items-center justify-center gap-2 transition-all shadow-glow-cyan"
              >
                {isUploading && <Loader2 className="w-4 h-4 animate-spin" />}
                <span>{isUploading ? "Đang lưu ảnh..." : "Lưu vào Media Library"}</span>
              </button>
            </div>
          </form>
        )}

        {/* Tab 3: Import Pinterest / CDN External Link */}
        {activeTab === "url" && (
          <form
            onSubmit={handleUrlSubmit}
            className="flex-1 p-8 flex flex-col justify-center max-w-lg mx-auto w-full space-y-4"
          >
            <div className="space-y-3">
              <div>
                <label className="text-xs text-slate-300 block mb-1">
                  Đường dẫn ảnh trực tiếp (Pinterest / Unsplash / CDN):
                </label>
                <input
                  type="url"
                  required
                  placeholder="https://i.pinimg.com/... hoặc https://images.unsplash.com/..."
                  value={externalUrl}
                  onChange={(e) => setExternalUrl(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-lg bg-thuy-800 border border-thuy-700 text-xs text-white focus:outline-none focus:border-thuy-400"
                />
              </div>

              {externalUrl && (
                <div className="relative w-full h-40 rounded-xl overflow-hidden border border-thuy-700 bg-thuy-950">
                  <Image
                    src={externalUrl}
                    alt="Preview"
                    fill
                    className="object-cover"
                    unoptimized
                  />
                </div>
              )}

              <div>
                <label className="text-xs text-slate-300 block mb-1">Tên file nhận diện:</label>
                <input
                  type="text"
                  value={externalFilename}
                  onChange={(e) => setExternalFilename(e.target.value)}
                  placeholder="villa-modern-pinterest.jpg"
                  className="w-full px-3 py-2 rounded-lg bg-thuy-800 border border-thuy-700 text-xs text-white"
                />
              </div>

              <div>
                <label className="text-xs text-slate-300 block mb-1">Thư mục:</label>
                <input
                  type="text"
                  value={externalFolder}
                  onChange={(e) => setExternalFolder(e.target.value)}
                  placeholder="pinterest, villa, townhouse..."
                  className="w-full px-3 py-2 rounded-lg bg-thuy-800 border border-thuy-700 text-xs text-white"
                />
              </div>

              <div>
                <label className="text-xs text-slate-300 block mb-1">Mô tả hình ảnh (Alt):</label>
                <input
                  type="text"
                  value={externalAlt}
                  onChange={(e) => setExternalAlt(e.target.value)}
                  placeholder="Biệt thự nghỉ dưỡng phong cách mệnh Thủy..."
                  className="w-full px-3 py-2 rounded-lg bg-thuy-800 border border-thuy-700 text-xs text-white"
                />
              </div>

              <button
                type="submit"
                disabled={!externalUrl || isImporting}
                className="w-full py-2.5 rounded-xl bg-thuy-400 text-thuy-950 font-bold text-xs hover:brightness-110 disabled:opacity-50 flex items-center justify-center gap-2 transition-all shadow-glow-cyan"
              >
                {isImporting && <Loader2 className="w-4 h-4 animate-spin" />}
                <span>{isImporting ? "Đang thêm..." : "Thêm vào Media Library"}</span>
              </button>
            </div>
          </form>
        )}

        {/* Footer for multiple selection confirmation */}
        {multiple && activeTab === "library" && (
          <div className="p-4 border-t border-thuy-700 bg-thuy-850 flex items-center justify-between">
            <span className="text-xs text-slate-300">
              Đã chọn: <b className="text-thuy-400">{selectedItems.length}</b> hình ảnh
            </span>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:bg-thuy-800 border border-thuy-700"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={handleConfirmMultiple}
                disabled={selectedItems.length === 0}
                className="px-5 py-2 rounded-xl text-xs font-bold text-thuy-950 bg-thuy-400 hover:brightness-110 disabled:opacity-50 shadow-glow-cyan"
              >
                Xác nhận thêm vào Gallery
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}


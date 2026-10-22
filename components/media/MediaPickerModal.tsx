"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { X, Upload, Link as LinkIcon, Search, Check, Folder, Loader2 } from "lucide-react";
import { playableVideoUrl, isVideoUrl } from "@/lib/media-url";

export interface MediaItem {
  id: string;
  filename: string;
  originalName: string | null;
  url: string;
  folder: string;
  alt: string | null;
  width?: number | null;
  height?: number | null;
  mimeType?: string | null;
}

interface MediaPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (media: MediaItem | MediaItem[]) => void;
  multiple?: boolean;
  selectedIds?: string[];
  title?: string;
  mediaType?: "image" | "video" | "all";
}

const MEDIA_SOURCES = [
  {
    id: "pinterest",
    label: "Pinterest",
    folder: "pinterest",
    placeholder: "https://i.pinimg.com/736x/.../abc.jpg",
    hint: "Nhấp chuột phải vào ảnh trên Pinterest → Copy image address.",
  },
  {
    id: "unsplash",
    label: "Unsplash",
    folder: "unsplash",
    placeholder: "https://images.unsplash.com/photo-xxxx?w=1920",
    hint: "Mở ảnh → Copy link ảnh, hoặc dùng link CDN images.unsplash.com.",
  },
  {
    id: "pexels",
    label: "Pexels",
    folder: "pexels",
    placeholder: "https://images.pexels.com/photos/xxxx/pexels-photo.jpg",
    hint: "Mở ảnh/video trên Pexels → Copy link tệp.",
  },
  {
    id: "mixkit",
    label: "Mixkit",
    folder: "mixkit",
    placeholder: "https://assets.mixkit.co/videos/preview/mixkit-xxxx-large.mp4",
    hint: "Nguồn video miễn phí, link kết thúc bằng .mp4 hoặc .webm.",
  },
  {
    id: "coverr",
    label: "Coverr",
    folder: "coverr",
    placeholder: "https://storage.coverr.co/videos/xxxx.mp4",
    hint: "Video nền miễn phí, link trực tiếp tới file .mp4.",
  },
  {
    id: "googledrive",
    label: "Google Drive",
    folder: "drive",
    placeholder: "https://drive.google.com/file/d/FILE_ID/view",
    hint: "Chia sẻ file → Anyone with the link. Video sẽ được phát qua proxy của website.",
  },
  {
    id: "youtube",
    label: "YouTube",
    folder: "youtube",
    placeholder: "https://www.youtube.com/watch?v=XXXXXXXXXXX",
    hint: "Dùng cho mã nhúng (tab Nền Hero sẽ hỗ trợ iframe nhúng).",
  },
  {
    id: "vimeo",
    label: "Vimeo",
    folder: "vimeo",
    placeholder: "https://vimeo.com/123456789",
    hint: "Dùng cho mã nhúng iframe trong cài đặt nền Hero.",
  },
  {
    id: "cloudinary",
    label: "Cloudinary",
    folder: "cloudinary",
    placeholder: "https://res.cloudinary.com/demo/video/upload/v123/hero.mp4",
    hint: "Link CDN trực tiếp tới file video .mp4.",
  },
  {
    id: "bunny",
    label: "Bunny CDN",
    folder: "bunny",
    placeholder: "https://cdn.bunny.net/hero.mp4",
    hint: "Link CDN trực tiếp tới file video .mp4.",
  },
  {
    id: "direct",
    label: "Link MP4 / Ảnh khác",
    folder: "external",
    placeholder: "https://.../hero.mp4",
    hint: "Bất kỳ link trực tiếp nào tới file .mp4, .webm hoặc ảnh.",
  },
];

export default function MediaPickerModal({
  isOpen,
  onClose,
  onSelect,
  multiple = false,
  selectedIds = [],
  title = "Chọn từ Media Library",
  mediaType = "image",
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

  // Form states for External URL (nhiều nguồn)
  const [externalUrl, setExternalUrl] = useState("");
  const [externalFilename, setExternalFilename] = useState("");
  const [externalFolder, setExternalFolder] = useState("pinterest");
  const [externalAlt, setExternalAlt] = useState("");
  const [externalSource, setExternalSource] = useState("pinterest");
  const [isImporting, setIsImporting] = useState(false);

  const isVideoItem = (item: MediaItem) => {
    if (item.mimeType && item.mimeType.startsWith("video/")) return true;
    return isVideoUrl(item.url || "");
  };

  const filteredMedia = mediaList.filter((item) => {
    if (mediaType === "all") return true;
    const isVideo = isVideoItem(item);
    return mediaType === "video" ? isVideo : !isVideo;
  });

  const externalIsVideo = isVideoUrl(externalUrl);
  const externalPlayable = externalIsVideo ? playableVideoUrl(externalUrl) : externalUrl;

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
                <span>Link nhiều nguồn</span>
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
                  <span>Đang tải thư viện...</span>
                </div>
              ) : filteredMedia.length === 0 ? (
                <div className="col-span-full text-center py-20 text-slate-400 text-xs">
                  Không tìm thấy {mediaType === "video" ? "video" : "hình ảnh"} nào phù hợp.
                </div>
              ) : (
                filteredMedia.map((item) => {
                  const isSelected = multiple
                    ? selectedItems.some((i) => i.id === item.id)
                    : selectedIds.includes(item.id);
                  const itemIsVideo = isVideoItem(item);

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
                      {itemIsVideo ? (
                        <video
                          src={playableVideoUrl(item.url)}
                          muted
                          loop
                          playsInline
                          preload="metadata"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Image
                          src={item.url}
                          alt={item.alt || item.filename}
                          fill
                          className="object-cover"
                          unoptimized
                        />
                      )}

                      {itemIsVideo && (
                        <div className="absolute bottom-2 left-2 px-1.5 py-0.5 rounded bg-black/70 text-[9px] font-bold text-thuy-300 uppercase">
                          Video
                        </div>
                      )}

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
                accept={
                  mediaType === "video"
                    ? "video/mp4,video/webm,video/quicktime"
                    : mediaType === "all"
                      ? "image/*,video/mp4,video/webm"
                      : "image/*"
                }
                onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
              />
              <label htmlFor="file-upload" className="cursor-pointer space-y-3 block">
                <div className="w-12 h-12 mx-auto rounded-full bg-thuy-800 flex items-center justify-center text-thuy-400">
                  <Upload className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm font-medium text-white">
                    {uploadFile
                      ? uploadFile.name
                      : mediaType === "video"
                        ? "Nhấn để chọn file video từ máy tính"
                        : "Nhấn để chọn file ảnh từ máy tính"}
                  </p>
                  <p className="text-xs text-slate-400 mt-1">
                    {mediaType === "video"
                      ? "MP4, WEBM lên đến 50MB"
                      : "PNG, JPG, WEBP lên đến 20MB"}
                  </p>
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

        {/* Tab 3: Import từ nhiều nguồn (Pinterest, Unsplash, Mixkit, CDN...) */}
        {activeTab === "url" && (
          <form
            onSubmit={handleUrlSubmit}
            className="flex-1 p-8 flex flex-col justify-center max-w-lg mx-auto w-full space-y-4 overflow-y-auto"
          >
            <div className="space-y-3">
              <div>
                <label className="text-xs text-slate-300 block mb-1">
                  Nguồn lấy link:
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                  {MEDIA_SOURCES.map((source) => (
                    <button
                      key={source.id}
                      type="button"
                      onClick={() => {
                        setExternalSource(source.id);
                        setExternalFolder(source.folder);
                        setExternalUrl("");
                      }}
                      className={`px-2 py-1.5 rounded-lg text-[11px] font-semibold transition-all border ${
                        externalSource === source.id
                          ? "bg-thuy-400 text-thuy-950 border-thuy-400"
                          : "bg-thuy-800 text-slate-300 hover:text-white border-thuy-700"
                      }`}
                    >
                      {source.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs text-slate-300 block mb-1">
                  Link trực tiếp (
                  {MEDIA_SOURCES.find((s) => s.id === externalSource)?.label}):
                </label>
                <input
                  type="text"
                  required
                  placeholder={
                    MEDIA_SOURCES.find((s) => s.id === externalSource)?.placeholder ||
                    "https://..."
                  }
                  value={externalUrl}
                  onChange={(e) => setExternalUrl(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-lg bg-thuy-800 border border-thuy-700 text-xs text-white focus:outline-none focus:border-thuy-400"
                />
                <p className="text-[10px] text-slate-500 mt-1">
                  {MEDIA_SOURCES.find((s) => s.id === externalSource)?.hint}
                </p>
              </div>

              {externalUrl && externalIsVideo ? (
                <div className="relative w-full h-40 rounded-xl overflow-hidden border border-thuy-700 bg-thuy-950">
                  <video
                    src={externalPlayable}
                    muted
                    loop
                    playsInline
                    autoPlay
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                externalUrl && (
                  <div className="relative w-full h-40 rounded-xl overflow-hidden border border-thuy-700 bg-thuy-950">
                    <Image
                      src={externalUrl}
                      alt="Preview"
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  </div>
                )
              )}

              <div>
                <label className="text-xs text-slate-300 block mb-1">Tên file nhận diện:</label>
                <input
                  type="text"
                  value={externalFilename}
                  onChange={(e) => setExternalFilename(e.target.value)}
                  placeholder="villa-modern-hero.mp4"
                  className="w-full px-3 py-2 rounded-lg bg-thuy-800 border border-thuy-700 text-xs text-white"
                />
              </div>

              <div>
                <label className="text-xs text-slate-300 block mb-1">Thư mục:</label>
                <input
                  type="text"
                  value={externalFolder}
                  onChange={(e) => setExternalFolder(e.target.value)}
                  placeholder="pinterest, villa, townhouse, mixkit..."
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


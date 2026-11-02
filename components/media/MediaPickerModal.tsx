"use client";

import React, { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import {
  X,
  Upload,
  Link as LinkIcon,
  Search,
  Check,
  Folder,
  Loader2,
  AlertCircle,
  Film,
  Image as ImageIcon,
  Grid3X3,
} from "lucide-react";
import {
  playableVideoUrl,
  isVideoUrl,
  DRIVE_FOLDER_REGEX,
  DRIVE_ID_REGEX,
} from "@/lib/media-url";

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
  { id: "pinterest", label: "Pinterest", folder: "pinterest" },
  { id: "unsplash", label: "Unsplash", folder: "unsplash" },
  { id: "pexels", label: "Pexels", folder: "pexels" },
  { id: "mixkit", label: "Mixkit", folder: "mixkit" },
  { id: "coverr", label: "Coverr", folder: "coverr" },
  { id: "googledrive", label: "Google Drive", folder: "drive" },
  { id: "youtube", label: "YouTube", folder: "youtube" },
  { id: "vimeo", label: "Vimeo", folder: "vimeo" },
  { id: "cloudinary", label: "Cloudinary", folder: "cloudinary" },
  { id: "bunny", label: "Bunny CDN", folder: "bunny" },
  { id: "direct", label: "Link MP4 / Ảnh khác", folder: "external" },
];

type GoogleDriveParseResult =
  | { type: "folder"; id: string }
  | { type: "file"; id: string; fileType: "image" | "video" }
  | null;
function getGoogleDriveUrl(
  url: string,
  fileName?: string,
): GoogleDriveParseResult {
  const trimmed = (url || "").trim();
  if (!trimmed) return null;

  const nameToCheck = (fileName || "").toLowerCase();
  const urlLower = trimmed.toLowerCase();

  const isVideoByName =
    /\.(mp4|mov|webm|mkv|avi|m4v|ogv)(\?.*)?$/i.test(nameToCheck) ||
    /\.(mp4|mov|webm|mkv|avi|m4v|ogv)(\?.*)?$/i.test(urlLower);

  if (/\/folders\//i.test(trimmed)) {
    const folderMatch = trimmed.match(/\/folders\/([a-zA-Z0-9_-]+)/);
    if (folderMatch && folderMatch[1])
      return { type: "folder", id: folderMatch[1] };
    const idParamMatch = trimmed.match(/[?&]id=([a-zA-Z0-9_-]+)/);
    if (idParamMatch && idParamMatch[1] && urlLower.includes("folders")) {
      return { type: "folder", id: idParamMatch[1] };
    }
  }

  if (/\/file\/d\//i.test(trimmed)) {
    const fileMatch = trimmed.match(
      /drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/,
    );
    if (fileMatch && fileMatch[1]) {
      return {
        type: "file",
        id: fileMatch[1],
        fileType: isVideoByName ? "video" : "image",
      };
    }
  }

  const idParamMatch = trimmed.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  if (idParamMatch && idParamMatch[1]) {
    if (urlLower.includes("folders") || urlLower.includes("drive/folders")) {
      return { type: "folder", id: idParamMatch[1] };
    }
    return {
      type: "file",
      id: idParamMatch[1],
      fileType: isVideoByName ? "video" : "image",
    };
  }

  return null;
}

const VIDEO_EXT_REGEX = /\.(mp4|mov|avi|webm|m4v|ogv)(\?.*)?$/i;
const IMAGE_EXT_REGEX = /\.(jpg|jpeg|png|gif|webp|avif|bmp|svg)(\?.*)?$/i;

function isVideoByFilename(filename: string): boolean {
  return filename ? VIDEO_EXT_REGEX.test(filename) : false;
}

function isImageByFilename(filename: string): boolean {
  return filename ? IMAGE_EXT_REGEX.test(filename) : false;
}

function getYoutubeEmbedUrl(url: string): string | null {
  const match = url.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{6,})/,
  );
  return match
    ? `https://youtube.com{match[1]}?autoplay=0&controls=1&rel=0`
    : null;
}

function getVimeoEmbedUrl(url: string): string | null {
  const match = url.match(/vimeo\.com\/(?:video\/)?(\d+)/);
  return match ? `https://vimeo.com{match[1]}?controls=1` : null;
}
export default function MediaPickerModal({
  isOpen,
  onClose,
  onSelect,
  multiple = false,
  selectedIds = [],
  title = "Chọn Ảnh/Video",
  mediaType = "image",
}: MediaPickerModalProps) {
  const [activeTab, setActiveTab] = useState<"library" | "upload" | "url">(
    "library",
  );
  const [mediaList, setMediaList] = useState<MediaItem[]>([]);
  const [folders, setFolders] = useState<string[]>([]);
  const [selectedFolder, setSelectedFolder] = useState<string>("all");
  const [search, setSearch] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [selectedItems, setSelectedItems] = useState<MediaItem[]>([]);

  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadFolder, setUploadFolder] = useState("general");
  const [uploadAlt, setUploadAlt] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  const [externalUrl, setExternalUrl] = useState("");
  const [externalFilename, setExternalFilename] = useState("");
  const [externalFolder, setExternalFolder] = useState("external");
  const [externalAlt, setExternalAlt] = useState("");
  const [externalSource, setExternalSource] = useState("direct");
  const [isImporting, setIsImporting] = useState(false);

  const [previewImages, setPreviewImages] = useState<string[]>([]);
  const [isLoadingFolder, setIsLoadingFolder] = useState(false);
  const [folderError, setFolderError] = useState<string | null>(null);
  const [selectedPreviewImage, setSelectedPreviewImage] = useState<
    string | null
  >(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewType, setPreviewType] = useState<
    "none" | "folder" | "image" | "video"
  >("none");

  const externalIsVideoUrl = isVideoUrl(externalUrl);
  const externalPlayable = externalIsVideoUrl
    ? playableVideoUrl(externalUrl)
    : externalUrl;

  const isVideoItem = (item: MediaItem) => {
    if (item.mimeType && item.mimeType.startsWith("video/")) return true;
    return isVideoUrl(item.url || "");
  };

  const filteredMedia = mediaList.filter((item) => {
    if (mediaType === "all") return true;
    const isVideo = isVideoItem(item);
    return mediaType === "video" ? isVideo : !isVideo;
  });
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
    if (isOpen) fetchMedia();
  }, [isOpen, selectedFolder, search]);

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

  const handleUseDirectUrl = () => {
    if (!externalUrl.trim()) return;
    const driveParsed = getGoogleDriveUrl(externalUrl, externalFilename);
    let finalUrl = externalUrl.trim();
    let looksVideo =
      isVideoByFilename(externalFilename) ||
      externalIsVideoUrl ||
      /\.(mp4|mov|webm|mkv|avi)(\?|$)/i.test(externalUrl);

    if (driveParsed?.type === "file") {
      if (driveParsed.fileType === "video" || looksVideo) {
        finalUrl = `/api/media/stream?url=${encodeURIComponent(`https://drive.google.com/uc?export=download&id=${driveParsed.id}`)}`;
        looksVideo = true;
      } else {
        finalUrl = `https://google.com{driveParsed.id}`;
        looksVideo = false;
      }
    }

    const filename =
      externalFilename.trim() || (looksVideo ? "video.mp4" : "image.jpg");

    const item: MediaItem = {
      id: `ext_${Date.now()}`,
      filename,
      originalName: externalFilename.trim() || null,
      url: finalUrl,
      folder: externalFolder,
      alt: externalAlt || null,
    };
    onSelect(item);
    onClose();
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadFile) return;
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", uploadFile);
      formData.append("folder", uploadFolder);
      formData.append("alt", uploadAlt);
      const res = await fetch("/api/media", { method: "POST", body: formData });
      const data = await res.json();
      if (data.media) {
        setUploadFile(null);
        setActiveTab("library");
        await fetchMedia();
        if (!multiple) {
          onSelect(data.media);
          onClose();
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsUploading(false);
    }
  };
  const renderUrlPreview = () => {
    if (!externalUrl.trim()) {
      return (
        <div className="w-full h-44 rounded-lg border-2 border-dashed border-slate-700 bg-slate-950/50 flex flex-col items-center justify-center text-slate-500 gap-2">
          <LinkIcon className="w-8 h-8" />
          <span className="text-xs text-center px-4">
            Dán link để xem trước nội dung
          </span>
        </div>
      );
    }

    const driveParsed = getGoogleDriveUrl(externalUrl, externalFilename);
    const isFolder =
      previewType === "folder" ||
      DRIVE_FOLDER_REGEX.test(externalUrl) ||
      (driveParsed && driveParsed.type === "folder");
    const youtubeEmbed = getYoutubeEmbedUrl(externalUrl);
    const vimeoEmbed = getVimeoEmbedUrl(externalUrl);

    if (youtubeEmbed) {
      return (
        <div className="w-full h-44 rounded-lg overflow-hidden border border-slate-700 bg-slate-950">
          <iframe
            src={youtubeEmbed}
            className="w-full h-full"
            allowFullScreen
            title="YouTube"
          />
        </div>
      );
    }

    if (vimeoEmbed) {
      return (
        <div className="w-full h-44 rounded-lg overflow-hidden border border-slate-700 bg-slate-950">
          <iframe
            src={vimeoEmbed}
            className="w-full h-full"
            allowFullScreen
            title="Vimeo"
          />
        </div>
      );
    }

    // Kiểm tra định dạng liên kết Google Drive độc lập để tránh ép sai kiểu
    const fileMatch =
      externalUrl.match(/file\/d\/([a-zA-Z0-9_-]+)/) ||
      externalUrl.match(/[?&]id=([a-zA-Z0-9_-]+)/);
    const isDriveFile =
      DRIVE_ID_REGEX.test(externalUrl) ||
      fileMatch !== null ||
      (driveParsed && driveParsed.type === "file");

    if (isDriveFile) {
      const fileId =
        driveParsed && driveParsed.type === "file"
          ? driveParsed.id
          : fileMatch
            ? fileMatch[1]
            : null;

      if (fileId) {
        if (
          driveParsed &&
          driveParsed.type === "file" &&
          driveParsed.fileType === "video"
        ) {
          return (
            <div className="w-full h-44 rounded-lg overflow-hidden border border-slate-700 bg-slate-950">
              <iframe
                src={`https://google.com{fileId}/preview`}
                className="w-full h-full"
                allowFullScreen
                title="Google Drive Video Preview"
              />
            </div>
          );
        }
        return (
          <div className="relative w-full h-44 rounded-lg overflow-hidden border border-slate-700 bg-slate-950">
            <img
              src={`https://google.com{fileId}`}
              alt="Drive Preview"
              className="w-full h-full object-contain"
              onError={() =>
                setFolderError("Lỗi hiển thị preview từ Google Drive.")
              }
            />
            <div className="absolute top-2 left-2 px-1.5 py-0.5 rounded bg-black/70 text-[9px] font-bold text-emerald-400 uppercase">
              Image
            </div>
          </div>
        );
      }
    }

    const isVideoFile =
      isVideoByFilename(externalFilename) ||
      externalIsVideoUrl ||
      /\.(mp4|mov|avi|webm)(\?|$)/i.test(externalUrl);
    if (isVideoFile) {
      return (
        <div className="relative w-full h-44 rounded-lg overflow-hidden border border-slate-700 bg-slate-950">
          <video
            src={externalPlayable}
            controls
            className="w-full h-full object-contain"
          />
          <div className="absolute top-2 left-2 px-1.5 py-0.5 rounded bg-black/70 text-[9px] font-bold text-cyan-400 uppercase">
            Video
          </div>
        </div>
      );
    }

    return (
      <div className="relative w-full h-44 rounded-lg overflow-hidden border border-slate-700 bg-slate-950">
        <Image
          src={externalUrl}
          alt="Preview"
          fill
          className="object-contain"
          unoptimized
        />
      </div>
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="fixed inset-0 bg-slate-950/80 backdrop-blur-md"
        onClick={onClose}
      />
      <div className="relative z-10 w-full max-w-4xl h-[85vh] bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-700 flex items-center justify-between bg-slate-850">
          <div>
            <h3 className="font-semibold text-lg text-white">{title}</h3>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-700">
              <button
                onClick={() => setActiveTab("library")}
                className={`px-3 py-1.5 rounded-lg text-xs ${activeTab === "library" ? "bg-cyan-400 text-slate-950 font-bold" : "text-slate-400"}`}
              >
                Thư Viện
              </button>
              <button
                onClick={() => setActiveTab("upload")}
                className={`px-3 py-1.5 rounded-lg text-xs ${activeTab === "upload" ? "bg-cyan-400 text-slate-950 font-bold" : "text-slate-400"}`}
              >
                Upload File
              </button>
              <button
                onClick={() => setActiveTab("url")}
                className={`px-3 py-1.5 rounded-lg text-xs ${activeTab === "url" ? "bg-cyan-400 text-slate-950 font-bold" : "text-slate-400"}`}
              >
                Link nhiều nguồn
              </button>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab content Thư Viện */}
        {activeTab === "library" && (
          <div className="flex-1 flex flex-col overflow-hidden p-5 space-y-4">
            <div className="flex-1 overflow-y-auto grid grid-cols-2 sm:grid-cols-4 gap-3">
              {filteredMedia.map((item) => (
                <div
                  key={item.id}
                  onClick={() => toggleSelect(item)}
                  className="relative aspect-square rounded-xl overflow-hidden cursor-pointer border border-slate-750 hover:border-cyan-400"
                >
                  {isVideoItem(item) ? (
                    <video
                      src={playableVideoUrl(item.url)}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Image
                      src={item.url}
                      alt={item.filename}
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab content Upload File */}
        {activeTab === "upload" && (
          <div className="flex-1 p-8 flex flex-col justify-center max-w-lg mx-auto w-full space-y-4">
            <input
              type="file"
              id="file-upload-modal"
              className="hidden"
              onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
            />
            <label
              htmlFor="file-upload-modal"
              className="border-2 border-dashed border-slate-700 p-8 rounded-2xl text-center block cursor-pointer bg-slate-850"
            >
              <Upload className="w-6 h-6 mx-auto text-cyan-400 mb-2" />
              <span className="text-sm text-white">
                {uploadFile
                  ? uploadFile.name
                  : "Chọn file ảnh/video từ thiết bị"}
              </span>
            </label>
            <button
              onClick={handleUploadSubmit}
              disabled={!uploadFile || isUploading}
              className="w-full py-2.5 rounded-xl bg-cyan-400 text-slate-950 font-bold text-xs"
            >
              {isUploading ? "Đang tải lên..." : "Tải lên thư viện"}
            </button>
          </div>
        )}

        {/* Tab content Link Nhiều Nguồn */}
        {activeTab === "url" && (
          <div className="flex-1 p-8 flex flex-col justify-center max-w-lg mx-auto w-full space-y-4 overflow-y-auto">
            <div className="space-y-3">
              <input
                type="text"
                placeholder="Dán link Google Drive, YouTube, Vimeo..."
                value={externalUrl}
                onChange={(e) => setExternalUrl(e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg bg-slate-800 text-xs text-white"
              />
              {renderUrlPreview()}
              {folderError && (
                <div className="text-xs text-red-400 p-2 bg-red-500/10 rounded-lg">
                  {folderError}
                </div>
              )}
              {externalUrl.trim() && (
                <button
                  type="button"
                  onClick={handleUseDirectUrl}
                  className="w-full py-2.5 rounded-xl bg-emerald-400 text-slate-950 font-bold text-xs"
                >
                  Chọn link này
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

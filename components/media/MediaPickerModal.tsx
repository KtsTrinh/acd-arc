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

type GoogleDriveParseResult =
  | { type: "folder"; id: string }
  | { type: "file"; id: string; fileType: "image" | "video" }
  | null;

function getGoogleDriveUrl(
  url: string,
  fileName?: string
): GoogleDriveParseResult {
  const trimmed = (url || "").trim();
  if (!trimmed) return null;

  const nameToCheck = (fileName || "").toLowerCase();
  const urlLower = trimmed.toLowerCase();
  const isVideoByName =
    /\.(mp4|mov|webm|mkv|avi)(\?.*)?$/i.test(nameToCheck) ||
    /\.(mp4|mov|webm|mkv|avi)(\?.*)?$/i.test(urlLower);
  const isImageByName =
    /\.(jpg|jpeg|png|gif|webp|avif|bmp|svg)(\?.*)?$/i.test(nameToCheck) ||
    /\.(jpg|jpeg|png|gif|webp|avif|bmp|svg)(\?.*)?$/i.test(urlLower);

  if (/\/folders\//i.test(trimmed)) {
    const folderMatch = trimmed.match(/\/folders\/([a-zA-Z0-9_-]+)/);
    if (folderMatch && folderMatch[1]) {
      return { type: "folder", id: folderMatch[1] };
    }
    const folderMatch2 = trimmed.match(
      /drive\.google\.com\/drive\/(?:u\/\d+\/)?folders\/([a-zA-Z0-9_-]+)/
    );
    if (folderMatch2 && folderMatch2[1]) {
      return { type: "folder", id: folderMatch2[1] };
    }
    const idParamMatch = trimmed.match(/[?&]id=([a-zA-Z0-9_-]+)/);
    if (idParamMatch && idParamMatch[1]) {
      return { type: "folder", id: idParamMatch[1] };
    }
  }

  if (/folders/i.test(trimmed) && !/\/file\//i.test(trimmed)) {
    const folderMatch = trimmed.match(
      /drive\.google\.com\/drive\/(?:u\/\d+\/)?folders\/([a-zA-Z0-9_-]+)/
    );
    if (folderMatch && folderMatch[1]) {
      return { type: "folder", id: folderMatch[1] };
    }
    const folderMatch3 = trimmed.match(/\/folders\/([a-zA-Z0-9_-]+)/);
    if (folderMatch3 && folderMatch3[1]) {
      return { type: "folder", id: folderMatch3[1] };
    }
  }

  if (/\/file\/d\//i.test(trimmed)) {
    const fileMatch = trimmed.match(
      /drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/
    );
    if (fileMatch && fileMatch[1]) {
      let fileType: "image" | "video" = "video";
      if (isImageByName && !isVideoByName) {
        fileType = "image";
      } else if (isVideoByName) {
        fileType = "video";
      } else {
        fileType = "video";
      }
      return {
        type: "file",
        id: fileMatch[1],
        fileType,
      };
    }
    const fileMatch2 = trimmed.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
    if (fileMatch2 && fileMatch2[1]) {
      let fileType: "image" | "video" = "video";
      if (isImageByName && !isVideoByName) {
        fileType = "image";
      } else if (isVideoByName) {
        fileType = "video";
      } else {
        fileType = "video";
      }
      return {
        type: "file",
        id: fileMatch2[1],
        fileType,
      };
    }
  }

  const idParamMatch = trimmed.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  if (idParamMatch && idParamMatch[1]) {
    let fileType: "image" | "video" = "video";
    if (isImageByName && !isVideoByName) {
      fileType = "image";
    } else if (isVideoByName) {
      fileType = "video";
    } else if (/(\/file\/|\/uc\?)/i.test(trimmed)) {
      fileType = "video";
    } else {
      fileType = "video";
    }

    if (/\/file\//i.test(trimmed)) {
      return {
        type: "file",
        id: idParamMatch[1],
        fileType,
      };
    }
    if (/(\/folders\/|folders)/i.test(trimmed)) {
      return { type: "folder", id: idParamMatch[1] };
    }
    if (/uc\?export=|googleusercontent|drive\.google\.com\/uc/i.test(trimmed)) {
      return {
        type: "file",
        id: idParamMatch[1],
        fileType,
      };
    }
    return {
      type: "file",
      id: idParamMatch[1],
      fileType,
    };
  }

  const openIdMatch = trimmed.match(/open\?id=([a-zA-Z0-9_-]+)/);
  if (openIdMatch && openIdMatch[1]) {
    let fileType: "image" | "video" = "video";
    if (isImageByName && !isVideoByName) {
      fileType = "image";
    } else if (isVideoByName) {
      fileType = "video";
    } else {
      fileType = "video";
    }
    return {
      type: "file",
      id: openIdMatch[1],
      fileType,
    };
  }

  const ucMatch = trimmed.match(/uc\?export=[^&]*&id=([a-zA-Z0-9_-]+)/);
  if (ucMatch && ucMatch[1]) {
    let fileType: "image" | "video" = "video";
    if (isImageByName && !isVideoByName) {
      fileType = "image";
    } else if (isVideoByName) {
      fileType = "video";
    } else {
      fileType = "video";
    }
    return {
      type: "file",
      id: ucMatch[1],
      fileType,
    };
  }

  return null;
}

const VIDEO_EXT_REGEX = /\.(mp4|mov|avi|webm|m4v|ogv)(\?.*)?$/i;
const IMAGE_EXT_REGEX = /\.(jpg|jpeg|png|gif|webp|avif|bmp|svg)(\?.*)?$/i;

function isVideoByFilename(filename: string): boolean {
  if (!filename) return false;
  return VIDEO_EXT_REGEX.test(filename);
}

function isImageByFilename(filename: string): boolean {
  if (!filename) return false;
  return IMAGE_EXT_REGEX.test(filename);
}

function getDriveFilePreviewUrl(fileId: string): string {
  return `https://drive.google.com/file/d/${fileId}/preview`;
}

function getDriveImageDirectUrl(fileId: string): string {
  return `https://drive.google.com/uc?export=view&id=${fileId}`;
}

function getYoutubeEmbedUrl(url: string): string | null {
  const match = url.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{6,})/
  );
  if (!match) return null;
  const id = match[1];
  return `https://www.youtube.com/embed/${id}?autoplay=0&controls=1&rel=0&modestbranding=1&playsinline=1`;
}

function getVimeoEmbedUrl(url: string): string | null {
  const match = url.match(/vimeo\.com\/(?:video\/)?(\d+)/);
  if (!match) return null;
  const id = match[1];
  return `https://player.vimeo.com/video/${id}?controls=1&playsinline=1`;
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
    "library"
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
  const [externalFolder, setExternalFolder] = useState("pinterest");
  const [externalAlt, setExternalAlt] = useState("");
  const [externalSource, setExternalSource] = useState("pinterest");
  const [isImporting, setIsImporting] = useState(false);

  const [previewImages, setPreviewImages] = useState<string[]>([]);
  const [isLoadingFolder, setIsLoadingFolder] = useState(false);
  const [folderError, setFolderError] = useState<string | null>(null);
  const [selectedPreviewImage, setSelectedPreviewImage] = useState<string | null>(
    null
  );
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewType, setPreviewType] = useState<
    "none" | "folder" | "image" | "video" | "embed"
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

  useEffect(() => {
    if (activeTab !== "url") {
      setPreviewImages([]);
      setIsLoadingFolder(false);
      setFolderError(null);
      setSelectedPreviewImage(null);
      setPreviewLoading(false);
      setPreviewType("none");
      return;
    }

    setPreviewImages([]);
    setFolderError(null);
    setSelectedPreviewImage(null);
    setPreviewLoading(false);
    setPreviewType("none");
  }, [activeTab]);

  const fetchDriveFolderPreview = useCallback(async (folderId: string) => {
    setIsLoadingFolder(true);
    setFolderError(null);
    setPreviewImages([]);
    setSelectedPreviewImage(null);
    setPreviewType("folder");

    try {
      const res = await fetch(
        `/api/media/import-folder?folderId=${encodeURIComponent(folderId)}`
      );
      const data = await res.json();

      if (!res.ok) {
        setFolderError(
          data?.error ||
            "Không thể truy cập thư mục. Vui lòng đảm bảo thư mục đã được chia sẻ 'Anyone with the link can view'."
        );
        setPreviewType("none");
        return;
      }

      if (data?.images && Array.isArray(data.images)) {
        setPreviewImages(data.images);
        if (data.images.length > 0) {
          setSelectedPreviewImage(data.images[0]);
        }
      } else if (data?.media && Array.isArray(data.media)) {
        const imageUrls = data.media
          .map((item: any) => item.url)
          .filter((url: string) => url && !isVideoUrl(url));
        setPreviewImages(imageUrls);
        if (imageUrls.length > 0) {
          setSelectedPreviewImage(imageUrls[0]);
        }
      } else {
        setFolderError(
          "Không tìm thấy hình ảnh nào trong thư mục này hoặc thư mục không có quyền truy cập."
        );
        setPreviewType("none");
      }
    } catch (err) {
      console.error("Error fetching drive folder:", err);
      setFolderError(
        "Đã xảy ra lỗi khi tải danh sách ảnh từ thư mục Google Drive. Vui lòng kiểm tra quyền chia sẻ."
      );
      setPreviewType("none");
    } finally {
      setIsLoadingFolder(false);
    }
  }, []);

  useEffect(() => {
    if (activeTab !== "url" || !externalUrl.trim()) {
      setPreviewType("none");
      return;
    }

    const driveParsed = getGoogleDriveUrl(externalUrl, externalFilename);

    if (driveParsed?.type === "folder") {
      setPreviewType("folder");
      fetchDriveFolderPreview(driveParsed.id);
      return;
    }

    if (driveParsed?.type === "file") {
      setPreviewImages([]);
      setIsLoadingFolder(false);
      setFolderError(null);
      setSelectedPreviewImage(null);
      setPreviewLoading(true);
      setPreviewType(driveParsed.fileType === "video" ? "video" : "image");
      setTimeout(() => setPreviewLoading(false), 300);
      return;
    }

    setPreviewImages([]);
    setIsLoadingFolder(false);
    setFolderError(null);
    setSelectedPreviewImage(null);
    setPreviewLoading(true);
    setPreviewType("none");
    setTimeout(() => setPreviewLoading(false), 200);
  }, [externalUrl, activeTab, externalFilename, fetchDriveFolderPreview]);

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

  const handleUseDirectUrl = () => {
    if (!externalUrl.trim()) return;

    const driveParsed = getGoogleDriveUrl(externalUrl, externalFilename);
    const isFolder =
      DRIVE_FOLDER_REGEX.test(externalUrl) || driveParsed?.type === "folder";
    if (isFolder) return;

    let finalUrl = externalUrl.trim();
      if (driveParsed?.type === "file") {
        if (driveParsed.fileType === "video") {
          const direct = `https://drive.google.com/uc?export=download&id=${driveParsed.id}`;
          finalUrl = `/api/media/stream?url=${encodeURIComponent(direct)}`;
        } else {
          finalUrl = `https://drive.google.com/uc?export=view&id=${driveParsed.id}`;
        }
      } else if (/^https?:\/\//i.test(externalUrl) && externalUrl.includes("drive.google.com")) {
        const idMatch = externalUrl.match(/id=([a-zA-Z0-9_-]+)/);
        if (idMatch && idMatch[1]) {
          const looksVideo = isVideoByFilename(externalFilename) || externalIsVideoUrl || /\.(mp4|mov|webm|mkv|avi)/i.test(externalUrl);
          if (looksVideo && !/\.(jpg|jpeg|png|gif|webp|avif|svg)(\?|$)/i.test(externalUrl)) {
            finalUrl = `/api/media/stream?url=${encodeURIComponent(
              `https://drive.google.com/uc?export=download&id=${idMatch[1]}`
            )}`;
          } else if (/\.(jpg|jpeg|png|gif|webp|avif|svg)(\?|$)/i.test(externalUrl)) {
            finalUrl = `https://drive.google.com/uc?export=view&id=${idMatch[1]}`;
          } else {
            finalUrl = `https://drive.google.com/uc?export=view&id=${idMatch[1]}`;
          }
        }
      } else if (/^https?:\/\//i.test(externalUrl) && !externalUrl.includes("/api/media/stream")) {
      // YouTube/Vimeo/embed không đổi, link mp4/webm/image trực tiếp giữ nguyên
      const lower = externalUrl.toLowerCase();
      if (lower.includes("youtube") || lower.includes("youtu.be") || lower.includes("vimeo")) {
        // giữ nguyên
      } else if (/\.(mp4|webm|mov|m4v|ogv)(\?|$)/i.test(externalUrl)) {
        // giữ nguyên để playableVideoUrl xử lý
      } else if (/\.(jpg|jpeg|png|gif|webp|avif|svg)(\?|$)/i.test(externalUrl)) {
        // giữ nguyên
      }
    }

    const filename =
      externalFilename.trim() ||
      (finalUrl.includes("/api/media/stream")
        ? "video.mp4"
        : finalUrl.split("/").pop()?.split("?")[0]) ||
      "external-media";

    const item: MediaItem = {
      id: `ext_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      filename,
      originalName: externalFilename.trim() || null,
      url: finalUrl,
      folder: externalFolder || "external",
      alt: externalAlt || null,
    };

    onSelect(item);
    onClose();
  };

  const shouldUseDirectUrl = () => {
    if (!externalUrl.trim()) return false;
    const driveParsed = getGoogleDriveUrl(externalUrl, externalFilename);
    const isFolder =
      DRIVE_FOLDER_REGEX.test(externalUrl) || driveParsed?.type === "folder";
    if (isFolder) return false;

    if (externalSource === "youtube" || externalSource === "vimeo") return true;
    if (externalSource === "direct") return true;
    if (externalSource === "mixkit" || externalSource === "coverr") return true;
    if (externalSource === "cloudinary" || externalSource === "bunny") return true;
    if (externalSource === "pinterest" || externalSource === "unsplash" || externalSource === "pexels") return true;

    if (driveParsed?.type === "file") return true;
    if (externalIsVideoUrl || isVideoByFilename(externalFilename)) return true;
    if (isImageByFilename(externalFilename)) return true;

    if (/^https?:\/\//i.test(externalUrl) && !externalUrl.includes("drive.google.com")) {
      return true;
    }

    return false;
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

  const handleUrlSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!externalUrl) return;

    if (shouldUseDirectUrl() && !multiple) {
      handleUseDirectUrl();
      return;
    }

    const isFolder = DRIVE_FOLDER_REGEX.test(externalUrl);
    const driveParsed = getGoogleDriveUrl(externalUrl, externalFilename);
    if (isFolder || driveParsed?.type === "folder") {
      setIsImporting(true);
      try {
        const folderId =
          driveParsed?.id ||
          externalUrl.match(/folders\/([a-zA-Z0-9_-]+)/)?.[1];
        const res = await fetch("/api/media/import-folder", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            url: externalUrl,
            folderId: folderId,
            folder: externalFolder,
          }),
        });
        const data = await res.json();

        if (data.success && data.media) {
          setExternalUrl("");
          setExternalFilename("");
          setExternalAlt("");
          setActiveTab("library");
          await fetchMedia();
          if (!multiple && data.media.length > 0) {
            onSelect(data.media[0]);
            onClose();
          }
        } else {
          setFolderError(data.error || "Có lỗi xảy ra khi import thư mục.");
        }
      } catch (err) {
        console.error("Import folder error:", err);
        setFolderError("Không thể kết nối đến máy chủ.");
      } finally {
        setIsImporting(false);
      }
      return;
    }

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

  const renderUrlPreview = () => {
    if (!externalUrl.trim()) {
      return (
        <div className="w-full h-44 rounded-lg border-2 border-dashed border-slate-700 bg-slate-950/50 flex flex-col items-center justify-center text-slate-500 gap-2 transition-all duration-300">
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
      driveParsed?.type === "folder";
    const isDriveFile =
      driveParsed?.type === "file" || DRIVE_ID_REGEX.test(externalUrl);
    const isDriveVideo =
      driveParsed?.type === "file" && driveParsed.fileType === "video";
    const isVideoFile =
      isVideoByFilename(externalFilename) || externalIsVideoUrl || isDriveVideo;
    const isImageFile = isImageByFilename(externalFilename) && !isVideoFile;
    const youtubeEmbed = getYoutubeEmbedUrl(externalUrl);
    const vimeoEmbed = getVimeoEmbedUrl(externalUrl);

    if (isFolder) {
      return (
        <div className="w-full rounded-lg border border-slate-700 bg-slate-950 overflow-hidden shadow-lg shadow-black/30 transition-all duration-300">
          <div className="px-3 py-2 bg-slate-900/80 border-b border-slate-700 flex items-center justify-between">
            <div className="flex items-center gap-2 text-slate-300">
              <Folder className="w-4 h-4 text-cyan-400" />
              <span className="text-xs font-medium">Thư mục Google Drive</span>
            </div>
            {isLoadingFolder && (
              <div className="flex items-center gap-1.5 text-xs text-cyan-400">
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Đang tải...</span>
              </div>
            )}
          </div>

          {isLoadingFolder ? (
            <div className="h-44 flex items-center justify-center">
              <Loader2 className="w-6 h-6 animate-spin text-cyan-400" />
            </div>
          ) : folderError ? (
            <div className="h-44 flex flex-col items-center justify-center gap-2 px-4 text-center">
              <AlertCircle className="w-6 h-6 text-red-400" />
              <span className="text-xs text-red-400">{folderError}</span>
            </div>
          ) : previewImages.length > 0 ? (
            <div className="p-2">
              <div className="grid grid-cols-3 gap-2 max-h-48 overflow-y-auto">
                {previewImages.map((imgUrl, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setSelectedPreviewImage(imgUrl);
                      setExternalUrl(imgUrl);
                      setPreviewType("image");
                    }}
                    className={`relative aspect-square rounded-md overflow-hidden border-2 transition-all duration-200 ${
                      selectedPreviewImage === imgUrl
                        ? "border-cyan-400 ring-1 ring-cyan-400/50"
                        : "border-slate-700 hover:border-slate-500"
                    }`}
                  >
                    <Image
                      src={imgUrl}
                      alt={`Ảnh ${idx + 1}`}
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  </button>
                ))}
              </div>
              <div className="text-[10px] text-slate-500 text-center mt-1.5">
                {previewImages.length} ảnh • Nhấn vào ảnh để chọn
              </div>
            </div>
          ) : (
            <div className="h-44 flex items-center justify-center text-xs text-slate-500">
              Không có ảnh để hiển thị
            </div>
          )}
        </div>
      );
    }

    if (youtubeEmbed) {
      return (
        <div className="w-full h-44 rounded-lg overflow-hidden border border-slate-700 bg-slate-950 shadow-lg shadow-black/30">
          <iframe
            src={youtubeEmbed}
            className="w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            title="YouTube Preview"
          />
        </div>
      );
    }

    if (vimeoEmbed) {
      return (
        <div className="w-full h-44 rounded-lg overflow-hidden border border-slate-700 bg-slate-950 shadow-lg shadow-black/30">
          <iframe
            src={vimeoEmbed}
            className="w-full h-full"
            allow="autoplay; fullscreen; picture-in-picture"
            allowFullScreen
            title="Vimeo Preview"
          />
        </div>
      );
    }

    if (isDriveFile && isVideoFile) {
      const driveParsedFile = getGoogleDriveUrl(externalUrl, externalFilename);
      const fileId =
        driveParsedFile?.type === "file"
          ? driveParsedFile.id
          : externalUrl.match(DRIVE_ID_REGEX)?.[1];
      if (fileId) {
        return (
          <div className="w-full h-44 rounded-lg overflow-hidden border border-slate-700 bg-slate-950 shadow-lg shadow-black/30">
            <iframe
              src={`https://drive.google.com/file/d/${fileId}/preview`}
              className="w-full h-full"
              allow="autoplay; fullscreen"
              allowFullScreen
              title="Google Drive Video Preview"
            />
          </div>
        );
      }
    }

    if (isVideoFile || externalIsVideoUrl) {
      return (
        <div className="relative w-full h-44 rounded-lg overflow-hidden border border-slate-700 bg-slate-950 shadow-lg shadow-black/30">
          {previewLoading ? (
            <div className="absolute inset-0 flex items-center justify-center">
              <Loader2 className="w-6 h-6 animate-spin text-cyan-400" />
            </div>
          ) : (
            <video
              src={externalPlayable}
              controls
              playsInline
              className="w-full h-full object-contain"
            />
          )}
          <div className="absolute top-2 left-2 px-1.5 py-0.5 rounded bg-black/70 text-[9px] font-bold text-cyan-400 uppercase flex items-center gap-1">
            <Film className="w-2.5 h-2.5" />
            Video
          </div>
        </div>
      );
    }

    if (isDriveFile && (isImageFile || driveParsed?.type === "file")) {
      if (driveParsed?.type === "file" && driveParsed.fileType === "video") {
        // đã xử lý ở trên
      } else {
        const driveParsedFile = getGoogleDriveUrl(externalUrl, externalFilename);
        const fileId =
          driveParsedFile?.type === "file"
            ? driveParsedFile.id
            : externalUrl.match(/id=([a-zA-Z0-9_-]+)/)?.[1];
        if (fileId) {
          return (
            <div className="relative w-full h-44 rounded-lg overflow-hidden border border-slate-700 bg-slate-950 shadow-lg shadow-black/30">
              {previewLoading ? (
                <div className="absolute inset-0 flex items-center justify-center">
                  <Loader2 className="w-6 h-6 animate-spin text-cyan-400" />
                </div>
              ) : (
                <img
                  src={`https://drive.google.com/uc?export=view&id=${fileId}`}
                  alt="Google Drive Preview"
                  className="w-full h-full object-contain"
                  onError={() =>
                    setFolderError(
                      "Không thể tải ảnh. Vui lòng kiểm tra quyền chia sẻ file (Anyone with the link can view)."
                    )
                  }
                />
              )}
              <div className="absolute top-2 left-2 px-1.5 py-0.5 rounded bg-black/70 text-[9px] font-bold text-emerald-400 uppercase flex items-center gap-1">
                <ImageIcon className="w-2.5 h-2.5" />
                Image
              </div>
            </div>
          );
        }
      }
    }

    if (externalUrl && !isVideoFile) {
      return (
        <div className="relative w-full h-44 rounded-lg overflow-hidden border border-slate-700 bg-slate-950 shadow-lg shadow-black/30">
          {previewLoading ? (
            <div className="absolute inset-0 flex items-center justify-center">
              <Loader2 className="w-6 h-6 animate-spin text-cyan-400" />
            </div>
          ) : (
            <Image
              src={externalUrl}
              alt="Preview"
              fill
              className="object-contain"
              unoptimized
            />
          )}
        </div>
      );
    }

    return (
      <div className="w-full h-44 rounded-lg border border-slate-700 bg-slate-950 flex flex-col items-center justify-center text-slate-500 gap-2">
        <Grid3X3 className="w-8 h-8" />
        <span className="text-xs">Không thể tạo xem trước</span>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="fixed inset-0 bg-slate-950/80 backdrop-blur-md"
        onClick={onClose}
      />

      <div className="relative z-10 w-full max-w-4xl h-[85vh] bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="p-5 border-b border-slate-700 flex items-center justify-between bg-slate-850">
          <div>
            <h3 className="font-semibold text-lg text-white">{title}</h3>
            <p className="text-xs text-slate-400">
              {multiple
                ? "Chọn một hoặc nhiều ảnh, sau đó nhấn xác nhận"
                : "Nhấn vào ảnh để chọn làm hình ảnh đại diện"}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-700">
              <button
                onClick={() => setActiveTab("library")}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  activeTab === "library"
                    ? "bg-cyan-400 text-slate-950 font-bold"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                Thư Viện
              </button>
              <button
                onClick={() => setActiveTab("upload")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  activeTab === "upload"
                    ? "bg-cyan-400 text-slate-950 font-bold"
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
                    ? "bg-cyan-400 text-slate-950 font-bold"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <LinkIcon className="w-3.5 h-3.5" />
                <span>Link nhiều nguồn</span>
              </button>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {activeTab === "library" && (
          <div className="flex-1 flex flex-col overflow-hidden p-5 space-y-4">
            <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
              <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
                <button
                  onClick={() => setSelectedFolder("all")}
                  className={`px-3 py-1 rounded-lg text-xs whitespace-nowrap transition-all ${
                    selectedFolder === "all"
                      ? "bg-cyan-400 text-slate-950 font-bold"
                      : "bg-slate-800 text-slate-300 hover:bg-slate-700"
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
                        ? "bg-cyan-400 text-slate-950 font-bold"
                        : "bg-slate-800 text-slate-300 hover:bg-slate-700"
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
                  className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-cyan-400 transition-colors"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 p-1">
              {loading ? (
                <div className="col-span-full flex items-center justify-center py-20 text-slate-400 gap-2">
                  <Loader2 className="w-5 h-5 animate-spin text-cyan-400" />
                  <span>Đang tải thư viện...</span>
                </div>
              ) : filteredMedia.length === 0 ? (
                <div className="col-span-full text-center py-20 text-slate-400 text-xs">
                  Không tìm thấy {mediaType === "video" ? "video" : "hình ảnh"}{" "}
                  nào phù hợp.
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
                      className={`group relative aspect-square rounded-xl overflow-hidden cursor-pointer border-2 transition-all duration-200 ${
                        isSelected
                          ? "border-cyan-400 ring-2 ring-cyan-400/30 scale-[0.98]"
                          : "border-slate-750 hover:border-slate-500 hover:scale-[1.02]"
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
                        <div className="absolute bottom-2 left-2 px-1.5 py-0.5 rounded bg-black/70 text-[9px] font-bold text-cyan-400 uppercase">
                          Video
                        </div>
                      )}

                      {isSelected && (
                        <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-cyan-400 text-slate-950 flex items-center justify-center font-bold shadow-md">
                          <Check className="w-4 h-4" />
                        </div>
                      )}

                      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-950/95 via-slate-950/60 to-transparent p-2 text-[11px] text-slate-200 truncate opacity-0 group-hover:opacity-100 transition-opacity">
                        {item.filename}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {activeTab === "upload" && (
          <form
            onSubmit={handleUploadSubmit}
            className="flex-1 p-8 flex flex-col justify-center max-w-lg mx-auto w-full space-y-4"
          >
            <div className="border-2 border-dashed border-slate-700 hover:border-cyan-400 rounded-2xl p-8 text-center cursor-pointer bg-slate-850/50 transition-colors duration-300">
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
                <div className="w-12 h-12 mx-auto rounded-full bg-slate-800 flex items-center justify-center text-cyan-400">
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
                <label className="text-xs text-slate-300 block mb-1">
                  Thư mục phân loại:
                </label>
                <input
                  type="text"
                  value={uploadFolder}
                  onChange={(e) => setUploadFolder(e.target.value)}
                  placeholder="villa, townhouse, interior..."
                  className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-xs text-white focus:outline-none focus:border-cyan-400 transition-colors"
                />
              </div>

              <div>
                <label className="text-xs text-slate-300 block mb-1">
                  Mô tả ảnh (Alt SEO):
                </label>
                <input
                  type="text"
                  value={uploadAlt}
                  onChange={(e) => setUploadAlt(e.target.value)}
                  placeholder="Ví dụ: Phối cảnh phòng khách biệt thự..."
                  className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-xs text-white focus:outline-none focus:border-cyan-400 transition-colors"
                />
              </div>

              <button
                type="submit"
                disabled={!uploadFile || isUploading}
                className="w-full py-2.5 rounded-xl bg-cyan-400 text-slate-950 font-bold text-xs hover:brightness-110 disabled:opacity-50 flex items-center justify-center gap-2 transition-all shadow-glow-cyan"
              >
                {isUploading && <Loader2 className="w-4 h-4 animate-spin" />}
                <span>
                  {isUploading ? "Đang lưu ảnh..." : "Lưu vào Media Library"}
                </span>
              </button>
            </div>
          </form>
        )}

        {activeTab === "url" && (
          <form
            onSubmit={handleUrlSubmit}
            className="flex-1 p-8 flex flex-col justify-center max-w-lg mx-auto w-full space-y-4 overflow-y-auto"
          >
            <div className="space-y-3">
              <div>
                <label className="text-xs text-slate-300 block mb-1">
                  Link trực tiếp:
                </label>
                <input
                  type="text"
                  required
                  placeholder="Dán link Google Drive, YouTube, Vimeo, hoặc link ảnh/video trực tiếp..."
                  value={externalUrl}
                  onChange={(e) => {
                    const url = e.target.value;
                    setExternalUrl(url);
                    if (url.includes("drive.google.com")) {
                      setExternalSource("googledrive");
                      setExternalFolder("drive");
                    } else if (url.includes("youtube.com") || url.includes("youtu.be")) {
                      setExternalSource("youtube");
                      setExternalFolder("youtube");
                    } else if (url.includes("vimeo.com")) {
                      setExternalSource("vimeo");
                      setExternalFolder("vimeo");
                    } else if (url.includes("pinterest")) {
                      setExternalSource("pinterest");
                      setExternalFolder("pinterest");
                    } else if (url.includes("unsplash")) {
                      setExternalSource("unsplash");
                      setExternalFolder("unsplash");
                    } else if (url.includes("pexels")) {
                      setExternalSource("pexels");
                      setExternalFolder("pexels");
                    } else if (url.includes("mixkit")) {
                      setExternalSource("mixkit");
                      setExternalFolder("mixkit");
                    } else if (url.includes("coverr")) {
                      setExternalSource("coverr");
                      setExternalFolder("coverr");
                    } else if (url.includes("cloudinary")) {
                      setExternalSource("cloudinary");
                      setExternalFolder("cloudinary");
                    } else if (url.includes("bunny")) {
                      setExternalSource("bunny");
                      setExternalFolder("bunny");
                    } else if (url) {
                      setExternalSource("direct");
                      setExternalFolder("external");
                    }
                  }}
                  className="w-full px-3 py-2.5 rounded-lg bg-slate-800 border border-slate-700 text-xs text-white focus:outline-none focus:border-cyan-400 transition-colors"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs text-slate-300 block">Xem trước:</label>
                {renderUrlPreview()}
                {folderError && (
                  <div className="flex items-start gap-2 p-2 rounded-lg bg-red-500/10 border border-red-500/40 text-xs text-red-400">
                    <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                    <span>{folderError}</span>
                  </div>
                )}
              </div>

              {shouldUseDirectUrl() && !multiple && externalUrl && (
                <button
                  type="button"
                  onClick={handleUseDirectUrl}
                  className="w-full py-2.5 rounded-xl bg-emerald-400 text-slate-950 font-bold text-xs hover:brightness-110 flex items-center justify-center gap-2 transition-all shadow-glow-cyan"
                >
                  <LinkIcon className="w-4 h-4" />
                  <span>Chọn link này</span>
                </button>
              )}

              {!shouldUseDirectUrl() && !multiple && externalUrl && !DRIVE_FOLDER_REGEX.test(externalUrl) && getGoogleDriveUrl(externalUrl, externalFilename)?.type !== "folder" && (
                <button
                  type="submit"
                  disabled={!externalUrl || isImporting}
                  className="w-full py-2.5 rounded-xl bg-cyan-400 text-slate-950 font-bold text-xs hover:brightness-110 disabled:opacity-50 flex items-center justify-center gap-2 transition-all shadow-glow-cyan"
                >
                  {isImporting && <Loader2 className="w-4 h-4 animate-spin" />}
                  <span>{isImporting ? "Đang xử lý..." : "Thêm vào Media Library"}</span>
                </button>
              )}
            </div>
          </form>
        )}

        {multiple && activeTab === "library" && (
          <div className="p-4 border-t border-slate-700 bg-slate-850 flex items-center justify-between">
            <span className="text-xs text-slate-300">
              Đã chọn: <b className="text-cyan-400">{selectedItems.length}</b>{" "}
              hình ảnh
            </span>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:bg-slate-800 border border-slate-700 transition-colors"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={handleConfirmMultiple}
                disabled={selectedItems.length === 0}
                className="px-5 py-2 rounded-xl text-xs font-bold text-slate-950 bg-cyan-400 hover:brightness-110 disabled:opacity-50 shadow-glow-cyan transition-all"
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

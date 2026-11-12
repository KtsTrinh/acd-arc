"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
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
  normalizeMediaUrl,
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
  allowExternalUrl?: boolean;
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
    placeholder:
      "https://assets.mixkit.co/videos/preview/mixkit-xxxx-large.mp4",
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
  | { type: "file"; id: string }
  | null;

function getGoogleDriveUrl(url: string): GoogleDriveParseResult {
  const trimmed = (url || "").trim();
  if (!trimmed) return null;

  // Ưu tiên phát hiện THƯ MỤC trước - kiểm tra từ khóa /folders/
  if (/\/folders\//i.test(trimmed)) {
    // Thư mục Google Drive: /drive/folders/ID hoặc các biến thể
    const folderMatch = trimmed.match(/\/folders\/([a-zA-Z0-9_-]+)/);
    if (folderMatch && folderMatch[1]) {
      return { type: "folder", id: folderMatch[1] };
    }
    // Thử dạng khác
    const folderMatch2 = trimmed.match(
      /drive\.google\.com\/drive\/(?:u\/\d+\/)?folders\/([a-zA-Z0-9_-]+)/,
    );
    if (folderMatch2 && folderMatch2[1]) {
      return { type: "folder", id: folderMatch2[1] };
    }
    // Thử từ id param nếu có trong ngữ cảnh folder
    const idParamMatch = trimmed.match(/[?&]id=([a-zA-Z0-9_-]+)/);
    if (idParamMatch && idParamMatch[1]) {
      return { type: "folder", id: idParamMatch[1] };
    }
  }

  // Thư mục Google Drive dạng khác
  if (/folders/i.test(trimmed) && !/\/file\//i.test(trimmed)) {
    const folderMatch = trimmed.match(
      /drive\.google\.com\/drive\/(?:u\/\d+\/)?folders\/([a-zA-Z0-9_-]+)/,
    );
    if (folderMatch && folderMatch[1]) {
      return { type: "folder", id: folderMatch[1] };
    }
  }

  // Tệp đơn lẻ Google Drive: /file/d/ID
  if (/\/file\/d\//i.test(trimmed)) {
    const fileMatch = trimmed.match(
      /drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/,
    );
    if (fileMatch && fileMatch[1]) {
      return { type: "file", id: fileMatch[1] };
    }
    const fileMatch2 = trimmed.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
    if (fileMatch2 && fileMatch2[1]) {
      return { type: "file", id: fileMatch2[1] };
    }
  }

  // Các dạng URL có ?id= (ưu tiên file nếu không phải folder)
  const idParamMatch = trimmed.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  if (idParamMatch && idParamMatch[1]) {
    if (/\/file\//i.test(trimmed)) {
      return { type: "file", id: idParamMatch[1] };
    }
    // Nếu không rõ ngữ cảnh, kiểm tra thêm
    if (/folders/i.test(trimmed)) {
      return { type: "folder", id: idParamMatch[1] };
    }
    return { type: "file", id: idParamMatch[1] };
  }

  // open?id=
  const openIdMatch = trimmed.match(/open\?id=([a-zA-Z0-9_-]+)/);
  if (openIdMatch && openIdMatch[1]) {
    return { type: "file", id: openIdMatch[1] };
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

function imagePreviewSrc(url: string): string {
  const isDrive =
    DRIVE_ID_REGEX.test(url) || /drive\.google\.com\/uc\?/i.test(url);
  return isDrive
    ? `/api/media/image-proxy?url=${encodeURIComponent(url)}`
    : normalizeMediaUrl(url);
}

function getYoutubeEmbedUrl(url: string): string | null {
  const match = url.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{6,})/,
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
  allowExternalUrl = true,
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

  // Form states for Upload
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadFolder, setUploadFolder] = useState("general");
  const [uploadAlt, setUploadAlt] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  // Form states for External URL
  const [externalUrl, setExternalUrl] = useState("");
  const [isImporting, setIsImporting] = useState(false);

  // Preview states for URL tab
  const [previewImages, setPreviewImages] = useState<string[]>([]);
  const [previewVideos, setPreviewVideos] = useState<string[]>([]);
  const [isLoadingFolder, setIsLoadingFolder] = useState(false);
  const [folderError, setFolderError] = useState<string | null>(null);
  const [selectedPreviewImage, setSelectedPreviewImage] = useState<
    string | null
  >(null);
  const [selectedPreviewUrls, setSelectedPreviewUrls] = useState<string[]>([]);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewType, setPreviewType] = useState<
    "none" | "folder" | "image" | "video" | "embed"
  >("none");

  const [dragStart, setDragStart] = useState<{ x: number; y: number } | null>(
    null,
  );
  const [dragCurrent, setDragCurrent] = useState<{
    x: number;
    y: number;
  } | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const gridContainerRef = useRef<HTMLDivElement>(null);
  const libraryGridRef = useRef<HTMLDivElement>(null);
  const justDraggedRef = useRef(false);

  const externalIsVideoUrl = isVideoUrl(externalUrl);
  const externalPlayable = externalIsVideoUrl
    ? playableVideoUrl(externalUrl)
    : externalUrl;

  const isVideoItem = (item: MediaItem) => {
    if (item.mimeType && item.mimeType.startsWith("video/")) return true;
    return isVideoUrl(item.url || "");
  };

  const handleGridMouseDown = (e: React.MouseEvent) => {
    const isLibrary = activeTab === "library";
    const target = isLibrary ? libraryGridRef.current : gridContainerRef.current;
    if (!target) return;
    const rect = target.getBoundingClientRect();
    if (!rect) return;
    setDragStart({ x: e.clientX - rect.left, y: e.clientY - rect.top });
    setDragCurrent({ x: e.clientX - rect.left, y: e.clientY - rect.top });
    setIsDragging(true);
  };

  const handleGridMouseMove = (e: React.MouseEvent) => {
    if (!dragStart || !isDragging) return;
    const isLibrary = activeTab === "library";
    const target = isLibrary ? libraryGridRef.current : gridContainerRef.current;
    if (!target) return;
    const rect = target.getBoundingClientRect();
    if (!rect) return;
    setDragCurrent({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  };

  const handleGridMouseUp = (_e: React.MouseEvent) => {
    if (!dragStart || !dragCurrent || !isDragging) {
      setDragStart(null);
      setDragCurrent(null);
      setIsDragging(false);
      return;
    }

    const isLibrary = activeTab === "library";
    const target = isLibrary ? libraryGridRef.current : gridContainerRef.current;
    if (!target) {
      setDragStart(null);
      setDragCurrent(null);
      setIsDragging(false);
      return;
    }

    const rect = target.getBoundingClientRect();
    if (!rect) {
      setDragStart(null);
      setDragCurrent(null);
      setIsDragging(false);
      return;
    }

    const endX = _e.clientX - rect.left;
    const endY = _e.clientY - rect.top;

    const dragDistance = Math.sqrt(
      Math.pow(dragCurrent.x - dragStart.x, 2) +
        Math.pow(dragCurrent.y - dragStart.y, 2),
    );

    const isClick = dragDistance < 5;

    if (!isClick) {
      const selectRect = {
        left: Math.min(dragStart.x, endX),
        top: Math.min(dragStart.y, endY),
        right: Math.max(dragStart.x, endX),
        bottom: Math.max(dragStart.y, endY),
      };

      const itemSelector = isLibrary ? '[data-library-item]' : '[data-preview-url]';
      const items = target.querySelectorAll(itemSelector) || [];
      const newlySelected: string[] = [];

      items.forEach((item) => {
        const itemRect = item.getBoundingClientRect();
        const itemRelativeRect = {
          left: itemRect.left - rect.left,
          top: itemRect.top - rect.top,
          right: itemRect.right - rect.left,
          bottom: itemRect.bottom - rect.top,
        };

        const intersects =
          itemRelativeRect.right > selectRect.left &&
          itemRelativeRect.left < selectRect.right &&
          itemRelativeRect.bottom > selectRect.top &&
          itemRelativeRect.top < selectRect.bottom;

        if (intersects) {
          if (isLibrary) {
            const mediaId = item.getAttribute('data-library-item');
            if (mediaId) {
              const itemObj = filteredMedia.find((m) => m.id === mediaId);
              if (itemObj && !selectedItems.some((i) => i.id === itemObj.id)) {
                newlySelected.push(mediaId);
              }
            }
          } else {
            const url = item.getAttribute('data-preview-url');
            if (url && !selectedPreviewUrls.includes(url)) {
              newlySelected.push(url);
            }
          }
        }
      });

      if (newlySelected.length > 0) {
        if (isLibrary) {
          const newItems = newlySelected
            .map((id) => filteredMedia.find((m) => m.id === id))
            .filter(Boolean) as MediaItem[];
          setSelectedItems((prev) => [...prev, ...newItems]);
        } else {
          setSelectedPreviewUrls((prev) => [...prev, ...newlySelected]);
        }
      }

      justDraggedRef.current = true;
    }

    setDragStart(null);
    setDragCurrent(null);
    setIsDragging(false);
  };

  const handlePreviewToggle = (url: string) => {
    if (justDraggedRef.current) {
      justDraggedRef.current = false;
      return;
    }
    setSelectedPreviewUrls((prev) =>
      prev.includes(url) ? prev.filter((u) => u !== url) : [...prev, url],
    );
  };

  const handleLibraryToggle = (item: MediaItem) => {
    if (justDraggedRef.current) {
      justDraggedRef.current = false;
      return;
    }
    toggleSelect(item);
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
      setPreviewVideos([]);
      setIsLoadingFolder(false);
      setFolderError(null);
      setSelectedPreviewImage(null);
      setPreviewLoading(false);
      setPreviewType("none");
      setSelectedPreviewUrls([]);
      setDragStart(null);
      setDragCurrent(null);
      setIsDragging(false);
      return;
    }

    setPreviewImages([]);
    setPreviewVideos([]);
    setFolderError(null);
    setSelectedPreviewImage(null);
    setPreviewLoading(false);
    setPreviewType("none");
    setDragStart(null);
    setDragCurrent(null);
    setIsDragging(false);
  }, [activeTab]);

  const fetchDriveFolderPreview = useCallback(async (folderId: string) => {
    setIsLoadingFolder(true);
    setFolderError(null);
    setPreviewImages([]);
    setPreviewVideos([]);
    setSelectedPreviewImage(null);
    setPreviewType("folder");
    setSelectedPreviewUrls([]);
    setDragStart(null);
    setDragCurrent(null);
    setIsDragging(false);

    try {
      const res = await fetch(
        `/api/media/import-folder?folderId=${encodeURIComponent(folderId)}`,
      );

      let data: any = null;
      const contentType = res.headers.get("content-type") || "";
      if (contentType.includes("application/json")) {
        data = await res.json();
      } else {
        const text = await res.text();
        console.error("Import folder non-JSON response:", text);
        throw new Error("Server trả về phản hồi không hợp lệ.");
      }

      if (!res.ok) {
        setFolderError(
          data?.error ||
            "Không thể truy cập thư mục. Vui lòng đảm bảo thư mục đã được chia sẻ 'Anyone with the link can view'.",
        );
        setPreviewType("none");
        return;
      }

      if (data?.images && Array.isArray(data.images)) {
        setPreviewImages(data.images);
      }
      if (data?.videos && Array.isArray(data.videos)) {
        setPreviewVideos(data.videos);
      }

      const total = (data.images?.length || 0) + (data.videos?.length || 0);
      if (total === 0) {
        setFolderError(
          "Không tìm thấy hình ảnh hoặc video nào trong thư mục này hoặc thư mục không có quyền truy cập.",
        );
        setPreviewType("none");
        return;
      }
    } catch (err: any) {
      console.error("Error fetching drive folder:", err);
      setFolderError(
        err?.message ||
          "Đã xảy ra lỗi khi tải danh sách từ thư mục Google Drive. Vui lòng kiểm tra quyền chia sẻ.",
      );
      setPreviewType("none");
    } finally {
      setIsLoadingFolder(false);
    }
  }, []);

  useEffect(() => {
    if (activeTab !== "url" || !externalUrl.trim()) {
      setPreviewType("none");
      setPreviewImages([]);
      setPreviewVideos([]);
      return;
    }

    const driveParsed = getGoogleDriveUrl(externalUrl);
    const folderId = driveParsed?.id || externalUrl.match(/folders\/([a-zA-Z0-9_-]+)/)?.[1];

    if ((driveParsed?.type === "folder" || DRIVE_FOLDER_REGEX.test(externalUrl)) && folderId) {
      setPreviewType("folder");
      fetchDriveFolderPreview(folderId);
    } else if (driveParsed?.type === "file") {
      setPreviewType("image");
    } else {
      setPreviewType("none");
    }
  }, [externalUrl, activeTab, fetchDriveFolderPreview]);

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

    const isFolder = DRIVE_FOLDER_REGEX.test(externalUrl);
    const driveParsed = getGoogleDriveUrl(externalUrl);
    if (isFolder || driveParsed?.type === "folder") {
      setIsImporting(true);
      try {
        const folderId =
          driveParsed?.id ||
          externalUrl.match(/folders\/([a-zA-Z0-9_-]+)/)?.[1];
        const selectedUrls =
          selectedPreviewUrls.length > 0
            ? selectedPreviewUrls
            : [...previewImages, ...previewVideos];
        const fileList: Array<{ id: string; name: string; url: string; mimeType?: string }> =
          selectedUrls.map((u, i) => ({
            id: `preview-${i}`,
            name: u.split("/").pop()?.split("?")[0] || `file-${i}`,
            url: u,
            mimeType: /\.(mp4|webm|mov|avi|m4v|ogv)(\?|$)/i.test(u)
              ? "video/mp4"
              : "image/jpeg",
          }));

        if (fileList.length > 0) {
          // Lưu từng file vào CSDL để có mediaId thực trước khi gắn vào gallery
          const savedMedia: MediaItem[] = [];
          for (const f of fileList) {
            try {
              const saveRes = await fetch("/api/media", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  url: f.url,
                  filename: f.name,
                  alt: null,
                  folder: "drive",
                  mimeType: f.mimeType || null,
                }),
              });
              const saveData = await saveRes.json();
              if (saveData.media) {
                savedMedia.push(saveData.media as MediaItem);
              }
            } catch (err) {
              console.error("Failed to save media item:", err);
            }
          }

          setExternalUrl("");
          setActiveTab("library");
          await fetchMedia();
          if (!multiple) {
            onSelect(savedMedia[0] || fileList[0]);
            onClose();
          } else {
            setSelectedItems(savedMedia);
            onSelect(savedMedia);
            onClose();
          }
        } else {
          setFolderError("Không tìm thấy tệp nào trong thư mục.");
        }
      } catch (err) {
        console.error("Import folder error:", err);
        setFolderError("Không thể kết nối đến máy chủ.");
      } finally {
        setIsImporting(false);
      }
      return;
    }

    const normalizedUrl = normalizeMediaUrl(externalUrl);
    const detectedMime = isVideoUrl(externalUrl)
      ? externalUrl.includes(".webm")
        ? "video/webm"
        : "video/mp4"
      : "image/jpeg";
    const filename =
      externalUrl.split("/").pop()?.split("?")[0] || "media";

    try {
      const saveRes = await fetch("/api/media", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url: normalizedUrl,
          filename,
          alt: null,
          folder: "external",
          mimeType: detectedMime,
        }),
      });
      const saveData = await saveRes.json();

      if (saveData.media) {
        const media: MediaItem = {
          id: saveData.media.id,
          filename: saveData.media.filename,
          originalName: saveData.media.originalName,
          url: saveData.media.url,
          folder: saveData.media.folder,
          alt: saveData.media.alt,
          mimeType: saveData.media.mimeType,
        };

        if (!multiple) {
          onSelect(media);
          onClose();
        } else {
          setSelectedItems([media]);
          onSelect([media]);
          onClose();
        }
      } else {
        setFolderError(saveData.error || "Không lưu được media từ URL.");
      }
    } catch (err) {
      console.error("Failed to save external media:", err);
      setFolderError("Không lưu được media từ URL.");
    }
    setExternalUrl("");
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

    const driveParsed = getGoogleDriveUrl(externalUrl);
    const isDriveFile =
      driveParsed?.type === "file" || DRIVE_ID_REGEX.test(externalUrl);
    const isDriveFolder =
      driveParsed?.type === "folder" || DRIVE_FOLDER_REGEX.test(externalUrl);
    const isVideoFile = externalIsVideoUrl || VIDEO_EXT_REGEX.test(externalUrl);
    const youtubeEmbed = getYoutubeEmbedUrl(externalUrl);
    const vimeoEmbed = getVimeoEmbedUrl(externalUrl);

    if (youtubeEmbed) {
      return (
        <div className="w-full h-44 rounded-lg overflow-hidden border border-slate-700 bg-slate-950 shadow-lg shadow-black/30">
          <iframe
            src={youtubeEmbed}
            className="w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-time"
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

    if (isDriveFolder) {
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
                <span>Đang quét...</span>
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
          ) : previewImages.length > 0 || previewVideos.length > 0 ? (
            <div className="p-2 space-y-2">
              <div className="flex items-center justify-between gap-2 mb-1">
                <span className="text-[10px] text-slate-500">
                  Đã chọn:{<b className="text-cyan-400 font-bold">{selectedPreviewUrls.length}</b>}/{previewImages.length + previewVideos.length}{" "}
                  <span className="text-slate-400">
                    (kéo chuột để chọn nhiều)
                  </span>
                </span>
                <div className="flex gap-1">
                  <button
                    type="button"
                    onClick={() => {
                      const all = [
                        ...previewImages,
                        ...previewVideos,
                      ];
                      setSelectedPreviewUrls(all);
                    }}
                    disabled={
                      selectedPreviewUrls.length >=
                      previewImages.length + previewVideos.length
                    }
                    className="px-2 py-1 rounded bg-slate-800 text-[9px] text-cyan-400 border border-slate-600 hover:bg-slate-700 disabled:opacity-50"
                    title="Chọn tất cả"
                  >
                    Chọn tất cả
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedPreviewUrls([])}
                    disabled={selectedPreviewUrls.length === 0}
                    className="px-2 py-1 rounded bg-red-950/60 text-[9px] text-red-400 border border-red-800 hover:bg-red-900 disabled:opacity-50"
                    title="Bỏ chọn tất cả"
                  >
                    Bỏ chọn tất cả
                  </button>
                </div>
              </div>
              <div
                ref={gridContainerRef}
                onMouseDown={handleGridMouseDown}
                onMouseMove={handleGridMouseMove}
                onMouseUp={handleGridMouseUp}
                className="relative grid grid-cols-4 sm:grid-cols-5 gap-1.5 max-h-44 overflow-y-auto"
              >
                {previewImages.map((imgUrl, idx) => (
                  <button
                    key={`img-${idx}`}
                    type="button"
                    data-preview-url={imgUrl}
                    onClick={(e) => handlePreviewToggle(imgUrl)}
                    className={`relative aspect-square rounded-md overflow-hidden border-2 transition-all duration-200 ${
                      selectedPreviewUrls.includes(imgUrl)
                        ? "border-cyan-400 ring-1 ring-cyan-400/50 scale-[0.98]"
                        : "border-slate-700 hover:border-slate-500"
                    }`}
                  >
                    <Image
                      src={imagePreviewSrc(imgUrl)}
                      alt={`Thumbnail ${idx + 1}`}
                      fill
                      className="object-cover"
                      unoptimized
                    />
                    {selectedPreviewUrls.includes(imgUrl) && (
                      <>
                        <div className="absolute top-1 right-1 w-5 h-5 rounded-full bg-cyan-400 text-slate-950 flex items-center justify-center font-bold shadow-md">
                          <Check className="w-3 h-3" />
                        </div>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedPreviewUrls((prev) =>
                              prev.filter((u) => u !== imgUrl),
                            );
                          }}
                          className="absolute top-1 left-1 w-5 h-5 rounded-full bg-red-500/90 text-white flex items-center justify-center shadow-md hover:bg-red-600"
                          title="Bỏ chọn"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </>
                    )}
                  </button>
                ))}
                {previewVideos.map((vidUrl, idx) => (
                  <button
                    key={`vid-${idx}`}
                    type="button"
                    data-preview-url={vidUrl}
                    onClick={(e) => handlePreviewToggle(vidUrl)}
                    className={`relative aspect-square rounded-md overflow-hidden border-2 transition-all duration-200 ${
                      selectedPreviewUrls.includes(vidUrl)
                        ? "border-cyan-400 ring-1 ring-cyan-400/50 scale-[0.98]"
                        : "border-slate-700 hover:border-slate-500"
                    }`}
                  >
                    <video
                      src={playableVideoUrl(vidUrl) || vidUrl}
                      muted
                      loop
                      playsInline
                      preload="metadata"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute bottom-2 left-2 px-1.5 py-0.5 rounded bg-black/70 text-[9px] font-bold text-cyan-400 uppercase">
                      Video
                    </div>
                    {selectedPreviewUrls.includes(vidUrl) && (
                      <>
                        <div className="absolute top-1 right-1 w-5 h-5 rounded-full bg-cyan-400 text-slate-950 flex items-center justify-center font-bold shadow-md">
                          <Check className="w-3 h-3" />
                        </div>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedPreviewUrls((prev) =>
                              prev.filter((u) => u !== vidUrl),
                            );
                          }}
                          className="absolute top-1 left-1 w-5 h-5 rounded-full bg-red-500/90 text-white flex items-center justify-center shadow-md hover:bg-red-600"
                          title="Bỏ chọn"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </>
                    )}
                  </button>
                ))}
                {dragStart && dragCurrent && (
                  <div
                    className="absolute pointer-events-none bg-cyan-400/20 border border-cyan-400 rounded-sm z-10"
                    style={{
                      left: Math.min(dragStart.x, dragCurrent.x),
                      top: Math.min(dragStart.y, dragCurrent.y),
                      width: Math.abs(dragCurrent.x - dragStart.x),
                      height: Math.abs(dragCurrent.y - dragStart.y),
                    }}
                  />
                )}
              </div>
              <div className="text-[10px] text-slate-500 text-center">
                Đã tìm thấy {previewImages.length} ảnh, {previewVideos.length} video.{" "}
                {selectedPreviewUrls.length > 0 ? (
                  <>
                    Đã chọn <b className="text-cyan-400">{selectedPreviewUrls.length}</b> mục.{" "}
                  </>
                ) : null}
                Kéo chuột qua các mục để chọn nhiều, hoặc nhấn từng mục để chọn/bỏ chọn.
              </div>
            </div>
          ) : (
            <div className="h-44 flex items-center justify-center text-xs text-slate-500">
              Không có ảnh hoặc video để hiển thị
            </div>
          )}
        </div>
      );
    }

    if (isDriveFile || isVideoFile || externalUrl) {
      const isVideo = isVideoFile || (isDriveFile && DRIVE_ID_REGEX.test(externalUrl));
      const videoSrc = playableVideoUrl(externalUrl) || externalUrl;
      const imageSrc = isDriveFile
        ? `/api/media/image-proxy?url=${encodeURIComponent(externalUrl)}`
        : externalUrl;

      if (isVideo) {
        return (
          <div className="relative w-full h-44 rounded-lg overflow-hidden border border-slate-700 bg-slate-950 shadow-lg shadow-black/30">
            <video
              src={videoSrc}
              controls
              playsInline
              className="w-full h-full object-contain"
            />
            <div className="absolute top-2 left-2 px-1.5 py-0.5 rounded bg-black/70 text-[9px] font-bold text-cyan-400 uppercase flex items-center gap-1">
              <Film className="w-2.5 h-2.5" />
              Video
            </div>
          </div>
        );
      }

      return (
        <div className="relative w-full h-44 rounded-lg overflow-hidden border border-slate-700 bg-slate-950 shadow-lg shadow-black/30">
          <Image
            src={imageSrc}
            alt="Preview"
            fill
            className="object-contain"
            unoptimized
            onError={() => {}}
          />
          <div className="absolute top-2 left-2 px-1.5 py-0.5 rounded bg-black/70 text-[9px] font-bold text-emerald-400 uppercase flex items-center gap-1">
            <ImageIcon className="w-2.5 h-2.5" />
            Image
          </div>
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
              {allowExternalUrl && (
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
              )}
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

            <div
              ref={libraryGridRef}
              onMouseDown={handleGridMouseDown}
              onMouseMove={handleGridMouseMove}
              onMouseUp={handleGridMouseUp}
              className="relative grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 p-1"
            >
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
                      data-library-item={item.id}
                      onClick={() => handleLibraryToggle(item)}
                      className={`group relative aspect-[1/1] min-h-[96px] rounded-xl overflow-hidden cursor-pointer border-2 transition-all duration-200 ${
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
                          src={imagePreviewSrc(item.url)}
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
              {dragStart && dragCurrent && activeTab === "library" && (
                <div
                  className="absolute pointer-events-none bg-cyan-400/20 border border-cyan-400 rounded-sm z-10"
                  style={{
                    left: Math.min(dragStart.x, dragCurrent.x),
                    top: Math.min(dragStart.y, dragCurrent.y),
                    width: Math.abs(dragCurrent.x - dragStart.x),
                    height: Math.abs(dragCurrent.y - dragStart.y),
                  }}
                />
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
              <label
                htmlFor="file-upload"
                className="cursor-pointer space-y-3 block"
              >
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
                  placeholder="https://..."
                  value={externalUrl}
                  onChange={(e) => setExternalUrl(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-lg bg-slate-800 border border-slate-700 text-xs text-white focus:outline-none focus:border-cyan-400 transition-colors"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs text-slate-300 block">
                  Xem trước:
                </label>
                {renderUrlPreview()}
                {folderError && (
                  <div className="flex items-start gap-2 p-2 rounded-lg bg-red-500/10 border border-red-500/40 text-xs text-red-400">
                    <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                    <span>{folderError}</span>
                  </div>
                )}
              </div>

              <button
                type="submit"
                disabled={!externalUrl || isImporting}
                className="w-full py-2.5 rounded-xl bg-cyan-400 text-slate-950 font-bold text-xs hover:brightness-110 disabled:opacity-50 flex items-center justify-center gap-2 transition-all shadow-glow-cyan"
              >
                {isImporting && <Loader2 className="w-4 h-4 animate-spin" />}
                <span>
                  {isImporting ? "Đang thêm..." : "Chọn"}
                </span>
              </button>
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

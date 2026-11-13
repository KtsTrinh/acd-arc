export type HeroVideoSource =
  | { kind: "file"; src: string }
  | { kind: "embed"; src: string }
  | null;

export const DRIVE_ID_REGEX =
  /drive\.google\.com\/(?:file\/d\/|open\?id=|uc\?id=)([a-zA-Z0-9_-]+)/;
export const DRIVE_FOLDER_REGEX =
  /drive\.google\.com\/drive\/(?:u\/\d+\/)?folders\/([a-zA-Z0-9_-]+)/;

const YOUTUBE_ID_REGEX =
  /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{6,})/;
const VIMEO_ID_REGEX = /vimeo\.com\/(?:video\/)?(\d+)/;

const VIDEO_FILE_REGEX = /\.(mp4|webm|mov|m4v|ogv)(\?.*)?$/i;

/**
 * Chuẩn hoá link Google Drive về link trực tiếp (dùng cho thẻ <img> hoặc <video>).
 * - Link xem file (file/d/ID/view, open?id=ID) -> uc?export=view&id=ID
 * - Link thư mục (drive/folders/ID) -> giữ nguyên (dùng cho import thư mục)
 * - Link uc?export=view&id=ID -> giữ nguyên
 */
export function normalizeDriveUrl(url: string): string {
  const trimmed = (url || "").trim();
  if (!trimmed) return "";

  // Nếu là link thư mục Drive, giữ nguyên
  if (DRIVE_FOLDER_REGEX.test(trimmed)) return trimmed;

  // Nếu đã là link uc?export=view, giữ nguyên
  if (/drive\.google\.com\/uc\?export=view/i.test(trimmed)) return trimmed;

  // Nếu là link xem file, chuyển về uc?export=view
  const driveFile = trimmed.match(DRIVE_ID_REGEX);
  if (driveFile) {
    return `https://drive.google.com/uc?export=view&id=${driveFile[1]}`;
  }

  return trimmed;
}

export function normalizeMediaUrl(url: string): string {
  const trimmed = (url || "").trim();
  if (!trimmed) return "";
  return normalizeDriveUrl(trimmed);
}

export function isDriveFileUrl(url: string): boolean {
  return DRIVE_ID_REGEX.test((url || "").trim());
}

/**
 * URL hiển thị/stream media qua proxy khi cần (Google Drive) để tránh chặn
 * hotlink/cookie hoặc header attachment khiến ảnh/video không hiện trên web.
 * Dùng /api/media/stream cho Drive để hỗ trợ cả ảnh/video và file lớn (confirm/range).
 */
export function proxiedMediaUrl(
  url: string,
  _mimeType?: string | null,
): string {
  const trimmed = (url || "").trim();
  if (!trimmed) return "";
  if (isDriveFileUrl(trimmed)) {
    const normalized = normalizeDriveUrl(trimmed);
    return `/api/media/stream?url=${encodeURIComponent(normalized)}`;
  }
  return normalizeMediaUrl(trimmed);
}

/**
 * Xác định URL có phải video không (theo đuôi file, YouTube/Vimeo, hoặc mime).
 */
export function isLikelyVideoUrl(url: string, mimeType?: string | null): boolean {
  if (mimeType && /^video\//i.test(mimeType)) return true;
  const trimmed = (url || "").trim();
  if (!trimmed) return false;
  if (VIDEO_FILE_REGEX.test(trimmed)) return true;
  if (YOUTUBE_ID_REGEX.test(trimmed) || VIMEO_ID_REGEX.test(trimmed)) return true;
  return false;
}

/** @deprecated Use isLikelyVideoUrl */
export function isVideoUrl(url: string): boolean {
  return isLikelyVideoUrl(url);
}

/**
 * Phân giải link video thành nguồn phát được cho hero:
 * - file .mp4/.webm trực tiếp -> thẻ <video>
 * - YouTube / Vimeo -> iframe nhúng
 * - Google Drive -> đi qua proxy của website (Drive gắn header
 *   `Content-Disposition: attachment` khiến trình duyệt tải file thay vì phát)
 */
export function resolveHeroVideo(url: string): HeroVideoSource {
  const trimmed = (url || "").trim();
  if (!trimmed) return null;

  const youtube = trimmed.match(YOUTUBE_ID_REGEX);
  if (youtube) {
    const id = youtube[1];
    return {
      kind: "embed",
      src: `https://www.youtube.com/embed/${id}?autoplay=1&mute=1&loop=1&playlist=${id}&controls=0&showinfo=0&rel=0&modestbranding=1&playsinline=1`,
    };
  }

  const vimeo = trimmed.match(VIMEO_ID_REGEX);
  if (vimeo) {
    return {
      kind: "embed",
      src: `https://player.vimeo.com/video/${vimeo[1]}?autoplay=1&muted=1&loop=1&background=1&controls=0&playsinline=1`,
    };
  }

  if (DRIVE_ID_REGEX.test(trimmed)) {
    return {
      kind: "file",
      src: `/api/media/stream?url=${encodeURIComponent(normalizeDriveUrl(trimmed))}`,
    };
  }

  return { kind: "file", src: normalizeMediaUrl(trimmed) };
}

/**
 * Link phát trực tiếp cho thẻ <video> (dùng cho preview trong admin).
 */
export function playableVideoUrl(url: string): string {
  const source = resolveHeroVideo(url);
  if (!source) return "";
  return source.kind === "file" ? source.src : "";
}

/**
 * Tính chiều rộng/cao thực của video từ chuỗi "720x1280".
 */
export function parseVideoAspect(aspect: string): {
  width: number;
  height: number;
} | null {
  const match = (aspect || "").trim().match(/^(\d+)\s*[xX×]\s*(\d+)$/);
  if (!match) return null;
  const width = Number(match[1]);
  const height = Number(match[2]);
  if (!width || !height) return null;
  return { width, height };
}

/**
 * Chọn cách hiển thị video nền.
 * - "cover": phủ kín toàn bộ khung nền (mặc định)
 * - "contain": vừa khung, giữ nguyên tỉ lệ (chỉ khi bạn cần thấy trọn video)
 */
export function resolveVideoFit(
  fitSetting: string,
  aspect: string
): "cover" | "contain" {
  if (fitSetting === "contain") return "contain";
  void aspect;
  return "cover";
}

export function getDriveFolderId(url: string): string | null {
  const match = (url || "").trim().match(DRIVE_FOLDER_REGEX);
  return match ? match[1] : null;
}

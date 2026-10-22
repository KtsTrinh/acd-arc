export type HeroVideoSource =
  | { kind: "file"; src: string }
  | { kind: "embed"; src: string }
  | null;

export const DRIVE_ID_REGEX =
  /drive\.google\.com\/(?:file\/d\/|open\?id=|uc\?id=)([a-zA-Z0-9_-]+)/;

const YOUTUBE_ID_REGEX =
  /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{6,})/;
const VIMEO_ID_REGEX = /vimeo\.com\/(?:video\/)?(\d+)/;

const VIDEO_FILE_REGEX = /\.(mp4|webm|mov|m4v|ogv)(\?.*)?$/i;

/**
 * Chuẩn hoá link Google Drive về link tải/trực tiếp (Drive share page không
 * phát được trong thẻ <video>).
 */
export function normalizeMediaUrl(url: string): string {
  const trimmed = (url || "").trim();
  if (!trimmed) return "";
  const drive = trimmed.match(DRIVE_ID_REGEX);
  if (drive) return `https://drive.google.com/uc?export=download&id=${drive[1]}`;
  return trimmed;
}

export function isVideoUrl(url: string): boolean {
  const trimmed = (url || "").trim();
  if (!trimmed) return false;
  if (VIDEO_FILE_REGEX.test(trimmed)) return true;
  if (DRIVE_ID_REGEX.test(trimmed)) return true;
  return false;
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
      src: `/api/media/stream?url=${encodeURIComponent(trimmed)}`,
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

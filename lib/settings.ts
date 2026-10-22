import { prisma } from "./prisma";

export interface SystemSettings {
  // General / System
  siteName: string;
  siteTagline: string;
  siteDescription: string;
  contactEmail: string;
  contactPhone: string;
  contactAddress: string;
  facebookUrl: string;
  instagramUrl: string;
  youtubeUrl: string;
  zaloNumber: string;
  maintenanceMode: string;
  heroBackgroundImage: string;
  heroBackgroundImageMobile: string;
  heroBackgroundType: string;
  heroBackgroundVideo: string;
  heroBackgroundVideoMobile: string;
  heroVideoPoster: string;
  heroVideoEmbedCode: string;
  heroOverlayOpacity: string;

  // SEO
  seoTitle: string;
  seoDescription: string;
  seoKeywords: string;
  seoOgImage: string;
  seoRobots: string;
  googleAnalyticsId: string;
  googleSiteVerification: string;

  // Custom Script
  headerEmbedCode: string;
  bodyEmbedCode: string;
}

export const defaultSettings: SystemSettings = {
  siteName: "ACD Architecture & Design",
  siteTagline: "Kiến Trúc Hợp Mệnh Ngũ Hành & Nội Thất Thượng Lưu",
  siteDescription:
    "ACD Studio - Đơn vị thiết kế kiến trúc biệt thự, nhà phố, penthouse và nội thất cao cấp theo phong thủy hợp mệnh (Kim - Mộc - Thủy - Hỏa - Thổ).",
  contactEmail: "contact@acd.vn",
  contactPhone: "0988.ACD.888",
  contactAddress: "Tòa nhà Heritage, P. Phan Chu Trinh, Hoàn Kiếm, Hà Nội",
  facebookUrl: "",
  instagramUrl: "",
  youtubeUrl: "",
  zaloNumber: "",
  maintenanceMode: "false",
  heroBackgroundImage:
    "https://i.pinimg.com/736x/ef/ec/58/efec58efa298d13dca0dde95e2528f20.jpg",
  heroBackgroundImageMobile: "",
  heroBackgroundType: "image",
  heroBackgroundVideo: "",
  heroBackgroundVideoMobile: "",
  heroVideoPoster: "",
  heroVideoEmbedCode: "",
  heroOverlayOpacity: "60",

  seoTitle: "ACD Architecture & Design | Kiến Trúc Hợp Mệnh Ngũ Hành & Nội Thất Thượng Lưu",
  seoDescription:
    "ACD Studio - Đơn vị thiết kế kiến trúc biệt thự, nhà phố, penthouse và nội thất cao cấp theo phong thủy hợp mệnh (Kim - Mộc - Thủy - Hỏa - Thổ). Cung cấp hệ sinh thái tài nguyên bản vẽ CAD, model 3D chuyên nghiệp.",
  seoKeywords:
    "kiến trúc biệt thự,thiết kế nội thất,nhà phố hiện đại,phong thủy hợp mệnh,phong thủy ngũ hành,bản vẽ autocad,model 3d kiến trúc,acd architecture",
  seoOgImage: "",
  seoRobots: "index, follow",
  googleAnalyticsId: "",
  googleSiteVerification: "",

  headerEmbedCode: "",
  bodyEmbedCode: "",
};

const CACHE_TTL_MS = 30_000;

let settingsCache: { data: SystemSettings; expiresAt: number } | null = null;
let inflight: Promise<SystemSettings> | null = null;

async function loadSettings(): Promise<SystemSettings> {
  try {
    const rows = await prisma.systemSetting.findMany();
    const map: Record<string, string> = {};
    for (const row of rows) {
      map[row.key] = row.value ?? "";
    }
    return { ...defaultSettings, ...map } as SystemSettings;
  } catch (error) {
    console.error("Error loading system settings:", error);
    return defaultSettings;
  }
}

/**
 * Đọc cấu hình hệ thống. Có cache TTL ngắn + gộp request đồng thời để không
 * mở quá nhiều connection tới Postgres trong môi trường serverless.
 */
export type HeroVideoSource =
  | { kind: "file"; src: string }
  | { kind: "embed"; src: string }
  | null;

const DRIVE_ID_REGEX =
  /drive\.google\.com\/(?:file\/d\/|open\?id=|uc\?id=)([a-zA-Z0-9_-]+)/;
const YOUTUBE_ID_REGEX =
  /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{6,})/;
const VIMEO_ID_REGEX = /vimeo\.com\/(?:video\/)?(\d+)/;

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

/**
 * Phân giải link video thành nguồn phát được cho hero:
 * - file .mp4/.webm trực tiếp -> thẻ <video>
 * - YouTube / Vimeo -> iframe nhúng
 * - Google Drive -> chuyển về link tải trực tiếp
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

  return { kind: "file", src: normalizeMediaUrl(trimmed) };
}

export async function getSettings(): Promise<SystemSettings> {
  const now = Date.now();
  if (settingsCache && settingsCache.expiresAt > now) {
    return settingsCache.data;
  }

  if (!inflight) {
    inflight = loadSettings()
      .then((data) => {
        settingsCache = { data, expiresAt: Date.now() + CACHE_TTL_MS };
        return data;
      })
      .finally(() => {
        inflight = null;
      });
  }

  return inflight;
}

export async function saveSettings(values: Partial<SystemSettings>) {
  const entries = Object.entries(values).filter(([, v]) => v !== undefined);
  await prisma.$transaction(
    entries.map(([key, value]) =>
      prisma.systemSetting.upsert({
        where: { key },
        create: { key, value: value ?? "" },
        update: { value: value ?? "" },
      })
    )
  );
  settingsCache = null;
}

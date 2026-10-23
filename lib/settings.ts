import { prisma } from "./prisma";

export {
  normalizeMediaUrl,
  resolveHeroVideo,
  playableVideoUrl,
  isVideoUrl,
  DRIVE_ID_REGEX,
} from "./media-url";
export type { HeroVideoSource } from "./media-url";

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
  heroVideoFit: string;
  heroVideoAspect: string;
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

  // Tích hợp & Xác thực
  resendApiKey: string;
  emailFrom: string;
  emailFromName: string;

  facebookAppId: string;
  facebookAppSecret: string;
  facebookRedirectUri: string;

  smsProvider: string;
  smsWebhookUrl: string;
  smsWebhookToken: string;
  smsSenderId: string;
  twilioAccountSid: string;
  twilioAuthToken: string;
  twilioPhoneNumber: string;

  // Nội bộ - không export ra source
  cmsAutoSync: string;
  cmsLastSyncSha: string;
  cmsLastSyncAt: string;
}

export const defaultSettings: SystemSettings = {
  siteName: "ACD Architecture & Design",
  siteTagline: "Kiáº¿n TrÃºc Há»£p Má»‡nh NgÅ© HÃ nh & Ná»™i Tháº¥t ThÆ°á»£ng LÆ°u",
  siteDescription:
    "ACD Studio - ÄÆ¡n vá»‹ thiáº¿t káº¿ kiáº¿n trÃºc biá»‡t thá»±, nhÃ  phá»‘, penthouse vÃ  ná»™i tháº¥t cao cáº¥p theo phong thá»§y há»£p má»‡nh (Kim - Má»™c - Thá»§y - Há»a - Thá»•).",
  contactEmail: "contact@acd.vn",
  contactPhone: "0988.ACD.888",
  contactAddress: "TÃ²a nhÃ  Heritage, P. Phan Chu Trinh, HoÃ n Kiáº¿m, HÃ  Ná»™i",
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
  heroVideoFit: "cover",
  heroVideoAspect: "",
  heroOverlayOpacity: "60",

  seoTitle: "ACD Architecture & Design | Kiáº¿n TrÃºc Há»£p Má»‡nh NgÅ© HÃ nh & Ná»™i Tháº¥t ThÆ°á»£ng LÆ°u",
  seoDescription:
    "ACD Studio - ÄÆ¡n vá»‹ thiáº¿t káº¿ kiáº¿n trÃºc biá»‡t thá»±, nhÃ  phá»‘, penthouse vÃ  ná»™i tháº¥t cao cáº¥p theo phong thá»§y há»£p má»‡nh (Kim - Má»™c - Thá»§y - Há»a - Thá»•). Cung cáº¥p há»‡ sinh thÃ¡i tÃ i nguyÃªn báº£n váº½ CAD, model 3D chuyÃªn nghiá»‡p.",
  seoKeywords:
    "kiáº¿n trÃºc biá»‡t thá»±,thiáº¿t káº¿ ná»™i tháº¥t,nhÃ  phá»‘ hiá»‡n Ä‘áº¡i,phong thá»§y há»£p má»‡nh,phong thá»§y ngÅ© hÃ nh,báº£n váº½ autocad,model 3d kiáº¿n trÃºc,acd architecture",
  seoOgImage: "",
  seoRobots: "index, follow",
  googleAnalyticsId: "",
  googleSiteVerification: "",

  headerEmbedCode: "",
  bodyEmbedCode: "",

  resendApiKey: "",
  emailFrom: "",
  emailFromName: "ACD Architecture",

  facebookAppId: "",
  facebookAppSecret: "",
  facebookRedirectUri: "",

  smsProvider: "webhook",
  smsWebhookUrl: "",
  smsWebhookToken: "",
  smsSenderId: "ACD",
  twilioAccountSid: "",
  twilioAuthToken: "",
  twilioPhoneNumber: "",

  cmsAutoSync: "true",
  cmsLastSyncSha: "",
  cmsLastSyncAt: "",
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

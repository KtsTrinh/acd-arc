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

export async function getSettings(): Promise<SystemSettings> {
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
}

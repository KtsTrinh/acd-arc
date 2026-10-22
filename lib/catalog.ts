/**
 * Danh mục sản phẩm thống nhất cho CMS.
 * Gộp 3 mục cũ: Dự Án Kiến Trúc + Danh Mục Dự Án + Sản Phẩm & File 3D/CAD
 * thành 4 nhóm: Dự Án Kiến Trúc, Nội Thất, Xây Dựng, File Kỹ Thuật Số.
 */

export const CATALOG_GROUPS = [
  {
    key: "ARCHITECTURE",
    label: "Dự Án Kiến Trúc",
    description: "Hồ sơ & bản vẽ kiến trúc: biệt thự, nhà phố, penthouse, resort",
    types: ["ARCHITECTURE"] as string[],
  },
  {
    key: "INTERIOR",
    label: "Nội Thất",
    description: "Thiết kế nội thất, model decor, vật liệu và bản vẽ nội thất",
    types: ["INTERIOR"] as string[],
  },
  {
    key: "CONSTRUCTION",
    label: "Xây Dựng",
    description: "Hồ sơ thi công, kết cấu, điện nước và bản vẽ kỹ thuật thi công",
    types: ["CONSTRUCTION"] as string[],
  },
  {
    key: "DIGITAL_FILE",
    label: "File Kỹ Thuật Số",
    description: "File CAD, model 3D, template trình bày và tài liệu kỹ thuật số",
    types: ["DIGITAL_FILE", "CAD", "MODEL_3D", "TEMPLATE", "DOCUMENT", "OTHER"] as string[],
  },
] as const;

export type CatalogGroupKey = (typeof CATALOG_GROUPS)[number]["key"];

/** Nhãn tiếng Việt cho từng loại sản phẩm (kể cả loại legacy) */
export const PRODUCT_TYPE_LABELS: Record<string, string> = {
  ARCHITECTURE: "Dự án kiến trúc",
  INTERIOR: "Nội thất",
  CONSTRUCTION: "Xây dựng",
  DIGITAL_FILE: "File kỹ thuật số",
  CAD: "Bản vẽ CAD",
  MODEL_3D: "Model 3D",
  TEMPLATE: "Template",
  DOCUMENT: "Tài liệu",
  OTHER: "Khác",
};

/** Map loại sản phẩm (kể cả legacy) về nhóm danh mục tương ứng */
export function getCatalogGroupOfType(type: string): CatalogGroupKey {
  const group = CATALOG_GROUPS.find((g) => g.types.includes(type));
  return (group?.key ?? "DIGITAL_FILE") as CatalogGroupKey;
}

/** Danh sách type thuộc một nhóm danh mục */
export function getTypesOfGroup(groupKey: string): string[] {
  const group = CATALOG_GROUPS.find((g) => g.key === groupKey);
  return group ? [...group.types] : [];
}

/**
 * Loại bỏ thông tin nhạy cảm khỏi payload gửi ra ngoài.
 * fileKey (khoá file private) và downloadLinkUrl (link gốc do admin cấu hình)
 * tuyệt đối không được lộ cho khách chưa thanh toán.
 */
export function sanitizeProduct<T extends Record<string, any>>(product: T): Omit<T, "fileKey" | "downloadLinkUrl"> & {
  hasFile: boolean;
  hasDownloadLink: boolean;
} {
  const { fileKey, downloadLinkUrl, ...rest } = product as any;
  return {
    ...rest,
    hasFile: Boolean(fileKey),
    hasDownloadLink: Boolean(downloadLinkUrl),
  };
}

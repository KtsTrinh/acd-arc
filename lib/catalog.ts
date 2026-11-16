/**
 * Catalog helpers.
 * Nhóm/danh mục sản phẩm hiện được quản lý động qua trường `productGroup`/`productCategory`.
 */

/** Nhãn tiếng Việt cho một số loại legacy (nếu còn dữ liệu cũ) */
export const PRODUCT_TYPE_LABELS: Record<string, string> = {
  DIGITAL_FILE: "File kỹ thuật số",
  CAD: "Bản vẽ CAD",
  MODEL_3D: "Model 3D",
  TEMPLATE: "Template",
  DOCUMENT: "Tài liệu",
  OTHER: "Khác",
};

/**
 * Loại bỏ thông tin nhạy cảm khỏi payload gửi ra ngoài.
 * fileKey (khoá file private) và downloadLinkUrl (link gốc do admin cấu hình)
 * tuyệt đối không được lộ cho khách chưa thanh toán.
 */
export function sanitizeProduct<T extends Record<string, any>>(
  product: T,
): Omit<T, "fileKey" | "downloadLinkUrl"> & {
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

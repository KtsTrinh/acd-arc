import crypto from "crypto";
import { prisma } from "./prisma";

const DEFAULT_EXPIRATION_MINUTES = parseInt(
  process.env.DOWNLOAD_TOKEN_EXPIRATION_MINUTES || "5",
  10
);
const DEFAULT_MAX_DOWNLOADS = parseInt(
  process.env.DOWNLOAD_TOKEN_MAX_COUNT || "5",
  10
);

/**
 * Generate secure download links for all products in an Order once paid.
 *
 * - Link gắn chặt với tài khoản đã thanh toán (order.userId).
 * - Link tự động xuất hiện ngay khi đơn chuyển sang trạng thái PAID
 *   (tức là trong vòng 5 phút sau khi khách thanh toán).
 * - Thời hạn sử dụng mặc định 5 phút, có thể tuỳ chỉnh theo từng mục danh mục
 *   (Product.downloadExpiresMinutes).
 */
export async function generateOrderDownloadLinks(
  orderId: string,
  options: { force?: boolean } = {}
) {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      items: true,
      downloads: true,
    },
  });

  if (!order) throw new Error("Order not found");

  const links: any[] = [];
  const now = Date.now();

  for (const item of order.items) {
    // Sản phẩm đã bị xoá khỏi danh mục -> không cấp link
    if (!item.productId) continue;

    const existing = order.downloads.find(
      (d) => d.productId === item.productId
    );

    // Link còn hiệu lực -> giữ nguyên (trừ khi quản trị yêu cầu cấp lại)
    if (
      !options.force &&
      existing &&
      new Date(existing.expiresAt).getTime() > now
    ) {
      links.push(existing);
      continue;
    }

    const product = await prisma.product.findUnique({
      where: { id: item.productId },
    });

    const expiresInMinutes =
      product?.downloadExpiresMinutes && product.downloadExpiresMinutes > 0
        ? product.downloadExpiresMinutes
        : DEFAULT_EXPIRATION_MINUTES;

    const expiresAt = new Date(now + expiresInMinutes * 60 * 1000);

    // Link đã hết hạn -> cấp lại mới cho lần thanh toán xác nhận tiếp theo
    if (existing) {
      const refreshed = await prisma.downloadLink.update({
        where: { id: existing.id },
        data: {
          token: crypto.randomBytes(32).toString("hex"),
          expiresAt,
          maxDownloads: DEFAULT_MAX_DOWNLOADS,
          downloadCount: 0,
          userId: order.userId,
        },
        include: { product: true },
      });
      links.push(refreshed);
      continue;
    }

    const token = crypto.randomBytes(32).toString("hex");

    const link = await prisma.downloadLink.create({
      data: {
        token,
        orderId: order.id,
        productId: item.productId,
        userId: order.userId,
        expiresAt,
        maxDownloads: DEFAULT_MAX_DOWNLOADS,
        downloadCount: 0,
      },
      include: {
        product: true,
      },
    });

    links.push(link);
  }

  return links;
}

/**
 * Validate download token and return download access info.
 *
 * Quy tắc bảo mật:
 * 1. Link phải tồn tại, chưa hết hạn, còn lượt tải.
 * 2. Đơn hàng phải ở trạng thái PAID.
 * 3. CHỈ người đã thanh toán (đúng tài khoản sở hữu đơn) được tải.
 *    Một người thanh toán -> link gắn với tài khoản đó, người khác
 *    (kể cả có link) vẫn không tải được.
 */
export async function validateDownloadToken(
  token: string,
  currentUser?: { id: string; role?: string } | null
) {
  const downloadLink = await prisma.downloadLink.findUnique({
    where: { token },
    include: {
      order: true,
      product: true,
    },
  });

  if (!downloadLink) {
    return { valid: false, error: "Liên kết tải về không tồn tại." };
  }

  // 1. Phải đăng nhập mới được tải
  if (!currentUser) {
    return {
      valid: false,
      error: "Vui lòng đăng nhập tài khoản đã thanh toán để tải file.",
    };
  }

  // 2. Order status must be PAID
  if (downloadLink.order.status !== "PAID") {
    return { valid: false, error: "Đơn hàng chưa được thanh toán thành công." };
  }

  // 3. Check token expiration
  if (new Date() > new Date(downloadLink.expiresAt)) {
    return {
      valid: false,
      error: "Liên kết tải về đã hết hạn.",
    };
  }

  // 4. Check download count limits
  if (downloadLink.downloadCount >= downloadLink.maxDownloads) {
    return {
      valid: false,
      error: `Bạn đã vượt quá số lần tải cho phép (${downloadLink.maxDownloads} lần).`,
    };
  }

  // 5. Chỉ chủ đơn (người đã thanh toán) hoặc quản trị viên được tải
  const isAdmin = currentUser.role === "ADMIN";
  const ownerId = downloadLink.userId || downloadLink.order.userId;

  if (!ownerId) {
    return {
      valid: false,
      error: "Đơn hàng này không gắn với tài khoản nào.",
    };
  }

  if (!isAdmin && ownerId !== currentUser.id) {
    return {
      valid: false,
      error: "Liên kết này chỉ dành cho tài khoản đã thanh toán.",
    };
  }

  return {
    valid: true,
    downloadLink,
  };
}

/**
 * Record a successful download attempt
 */
export async function incrementDownloadCount(id: string) {
  return prisma.downloadLink.update({
    where: { id },
    data: {
      downloadCount: {
        increment: 1,
      },
    },
  });
}

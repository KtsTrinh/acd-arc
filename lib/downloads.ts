import crypto from "crypto";
import { prisma } from "./prisma";

const DEFAULT_EXPIRATION_HOURS = parseInt(
  process.env.DOWNLOAD_TOKEN_EXPIRATION_HOURS || "72",
  10
);
const DEFAULT_MAX_DOWNLOADS = parseInt(
  process.env.DOWNLOAD_TOKEN_MAX_COUNT || "5",
  10
);

/**
 * Generate secure download links for all products in an Order once paid
 */
export async function generateOrderDownloadLinks(orderId: string) {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      items: true,
      downloads: true,
    },
  });

  if (!order) throw new Error("Order not found");

  const links: any[] = [];
  const expiresAt = new Date(Date.now() + DEFAULT_EXPIRATION_HOURS * 60 * 60 * 1000);

  for (const item of order.items) {
    // Check if token already exists for this order & product
    const existing = order.downloads.find((d) => d.productId === item.productId);
    if (existing) {
      links.push(existing);
      continue;
    }

    // Generate cryptographically strong random token
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
 * Validate download token and return download access info
 */
export async function validateDownloadToken(token: string) {
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

  // 1. Order status must be PAID
  if (downloadLink.order.status !== "PAID") {
    return { valid: false, error: "Đơn hàng chưa được thanh toán thành công." };
  }

  // 2. Check token expiration
  if (new Date() > new Date(downloadLink.expiresAt)) {
    return {
      valid: false,
      error: "Liên kết tải về đã hết hạn (chỉ có hiệu lực trong 72 giờ).",
    };
  }

  // 3. Check download count limits
  if (downloadLink.downloadCount >= downloadLink.maxDownloads) {
    return {
      valid: false,
      error: `Bạn đã vượt quá số lần tải cho phép (${downloadLink.maxDownloads} lần).`,
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

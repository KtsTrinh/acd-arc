import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateOrderDownloadLinks } from "@/lib/downloads";
import { getCurrentUser } from "@/lib/auth";
import { sanitizeProduct } from "@/lib/catalog";

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { error: "Vui lòng đăng nhập để cập nhật đơn hàng." },
        { status: 401 }
      );
    }

    const { id } = params;
    const body = await request.json();
    const { status } = body;

    if (!["PENDING", "PAID", "CANCELLED", "REFUNDED"].includes(status)) {
      return NextResponse.json(
        { error: "Trạng thái đơn hàng không hợp lệ." },
        { status: 400 }
      );
    }

    const order = await prisma.order.findUnique({ where: { id } });

    if (!order) {
      return NextResponse.json(
        { error: "Không tìm thấy đơn hàng." },
        { status: 404 }
      );
    }

    const isAdmin = user.role === "ADMIN";
    const isOwner = Boolean(order.userId) && order.userId === user.id;

    // Chỉ quản trị viên hoặc chủ đơn (mô phỏng thanh toán) được đổi trạng thái
    if (!isAdmin && !isOwner) {
      return NextResponse.json(
        { error: "Bạn không có quyền cập nhật đơn hàng này." },
        { status: 403 }
      );
    }

    // Khách chỉ được tự xác nhận thanh toán cho đơn của mình đang chờ
    if (!isAdmin && order.status !== "PENDING") {
      return NextResponse.json(
        { error: "Đơn hàng này đã được xử lý." },
        { status: 400 }
      );
    }

    const updatedOrder = await prisma.order.update({
      where: { id },
      data: { status },
      include: {
        items: true,
        downloads: true,
      },
    });

    let downloadLinks = updatedOrder.downloads;

    // Đơn chuyển sang PAID -> cấp link tải riêng cho tài khoản đã thanh toán
    if (status === "PAID") {
      downloadLinks = await generateOrderDownloadLinks(id);
    }

    return NextResponse.json({
      success: true,
      order: {
        ...updatedOrder,
        downloads: downloadLinks.map((dl: any) => ({
          ...dl,
          product: dl.product ? sanitizeProduct(dl.product) : null,
        })),
      },
    });
  } catch (error) {
    console.error("Error updating order status:", error);
    return NextResponse.json(
      { error: "Không thể cập nhật trạng thái đơn hàng." },
      { status: 500 }
    );
  }
}

/** Cấp lại link tải cho đơn đã thanh toán (hết hạn / mất link) */
export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Chỉ quản trị viên mới được cấp lại link tải." },
        { status: 403 }
      );
    }

    const { id } = params;
    const order = await prisma.order.findUnique({ where: { id } });

    if (!order) {
      return NextResponse.json(
        { error: "Không tìm thấy đơn hàng." },
        { status: 404 }
      );
    }

    if (order.status !== "PAID") {
      return NextResponse.json(
        { error: "Chỉ cấp link tải cho đơn đã thanh toán." },
        { status: 400 }
      );
    }

    const downloadLinks = await generateOrderDownloadLinks(id, { force: true });

    return NextResponse.json({
      success: true,
      downloads: downloadLinks.map((dl: any) => ({
        ...dl,
        product: dl.product ? sanitizeProduct(dl.product) : null,
      })),
    });
  } catch (error) {
    console.error("Error regenerating download links:", error);
    return NextResponse.json(
      { error: "Không thể cấp lại link tải." },
      { status: 500 }
    );
  }
}

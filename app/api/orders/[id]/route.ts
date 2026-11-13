import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { sanitizeProduct } from "@/lib/catalog";

export const dynamic = "force-dynamic";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser();
    const { id } = params;

    if (!id) {
      return NextResponse.json({ error: "Thiếu mã đơn hàng." }, { status: 400 });
    }

    const order = await prisma.order.findFirst({
      where: {
        OR: [{ id }, { orderNumber: id }],
      },
      include: {
        items: {
          include: {
            product: true,
          },
        },
        downloads: {
          include: {
            product: true,
          },
        },
      },
    });

    if (!order) {
      return NextResponse.json({ error: "Không tìm thấy đơn hàng." }, { status: 404 });
    }

    const isAdmin = user?.role === "ADMIN" || user?.role === "SUPER_ADMIN";
    const isOwner = Boolean(user?.id) && Boolean(order.userId) && order.userId === user.id;

    if (!isAdmin && !isOwner) {
      return NextResponse.json({ error: "Bạn không có quyền xem đơn hàng này." }, { status: 403 });
    }

    const sanitized = {
      ...order,
      items: order.items.map((item) => ({
        ...item,
        product: item.product ? sanitizeProduct(item.product) : null,
      })),
      downloads: order.downloads.map((dl) => ({
        ...dl,
        product: dl.product ? sanitizeProduct(dl.product) : null,
      })),
    };

    return NextResponse.json({ order: sanitized });
  } catch (error) {
    console.error("Error fetching order:", error);
    return NextResponse.json(
      { error: "Không thể lấy thông tin đơn hàng." },
      { status: 500 }
    );
  }
}
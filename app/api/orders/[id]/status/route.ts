import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateOrderDownloadLinks } from "@/lib/downloads";

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();
    const { status } = body;

    if (!["PENDING", "PAID", "CANCELLED", "REFUNDED"].includes(status)) {
      return NextResponse.json(
        { error: "Trạng thái đơn hàng không hợp lệ." },
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

    // If marked as PAID and doesn't have download links yet, generate them!
    if (status === "PAID" && downloadLinks.length === 0) {
      downloadLinks = await generateOrderDownloadLinks(id);
    }

    return NextResponse.json({
      success: true,
      order: {
        ...updatedOrder,
        downloads: downloadLinks,
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


import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { generateOrderNumber } from "@/lib/utils";
import { generateOrderDownloadLinks } from "@/lib/downloads";
import { sanitizeProduct } from "@/lib/catalog";

export async function GET(request: Request) {
  try {
    const user = await getCurrentUser();
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const search = searchParams.get("search");

    const where: any = {};

    // If not admin, only return user's own orders
    if (!user || user.role !== "ADMIN") {
      if (!user) {
        return NextResponse.json({ orders: [] });
      }
      where.userId = user.id;
    }

    if (status && status !== "ALL") {
      where.status = status;
    }

    if (search) {
      where.OR = [
        { orderNumber: { contains: search, mode: "insensitive" } },
        { customerName: { contains: search, mode: "insensitive" } },
        { customerEmail: { contains: search, mode: "insensitive" } },
      ];
    }

    const orders = await prisma.order.findMany({
      where,
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
      orderBy: { createdAt: "desc" },
    });

    // Không bao giờ trả khoá file / link gốc cho khách
    const sanitized = orders.map((order) => ({
      ...order,
      items: order.items.map((item) => ({
        ...item,
        product: item.product ? sanitizeProduct(item.product) : null,
      })),
      downloads: order.downloads.map((dl) => ({
        ...dl,
        product: dl.product ? sanitizeProduct(dl.product) : null,
      })),
    }));

    return NextResponse.json({ orders: sanitized });
  } catch (error) {
    console.error("Error fetching orders:", error);
    return NextResponse.json(
      { error: "Không thể lấy danh sách đơn hàng." },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { error: "Vui lòng đăng nhập để đặt hàng." },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { customerName, customerEmail, customerPhone, paymentMethod, items, autoPay } = body;

    if (!customerName || !customerEmail || !items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: "Vui lòng cung cấp đầy đủ thông tin khách hàng và giỏ hàng." },
        { status: 400 }
      );
    }

    // Verify products and calculate total on backend to prevent client tampering
    let calculatedTotal = 0;
    const orderItemsData = [];

    for (const item of items) {
      const product = await prisma.product.findUnique({
        where: { id: item.id },
      });

      if (!product || !product.active) {
        return NextResponse.json(
          { error: `Sản phẩm ${item.name || item.id} không còn khả dụng.` },
          { status: 400 }
        );
      }

      calculatedTotal += product.price * (item.quantity || 1);
      orderItemsData.push({
        productId: product.id,
        productName: product.name,
        price: product.price,
        quantity: item.quantity || 1,
      });
    }

    const orderNumber = generateOrderNumber();
    const initialStatus = autoPay ? "PAID" : "PENDING";

    const order = await prisma.order.create({
      data: {
        orderNumber,
        userId: user.id,
        customerName,
        customerEmail: customerEmail.toLowerCase().trim(),
        customerPhone: customerPhone || "",
        status: initialStatus,
        total: calculatedTotal,
        paymentMethod: paymentMethod || "VIETQR",
        paymentNote: autoPay ? "Thanh toán trực tuyến thành công" : "Chờ xác nhận thanh toán",
        items: {
          create: orderItemsData,
        },
      },
      include: {
        items: true,
      },
    });

    let downloadLinks: any[] = [];
    if (initialStatus === "PAID") {
      downloadLinks = await generateOrderDownloadLinks(order.id);
    }

    return NextResponse.json({
      success: true,
      order: {
        ...order,
        downloadLinks: downloadLinks.map((dl: any) => ({
          ...dl,
          product: dl.product ? sanitizeProduct(dl.product) : null,
        })),
      },
    });
  } catch (error) {
    console.error("Error creating order:", error);
    return NextResponse.json(
      { error: "Lỗi trong quá trình tạo đơn hàng." },
      { status: 500 }
    );
  }
}

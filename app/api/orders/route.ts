import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { generateOrderNumber } from "@/lib/utils";
import { sanitizeProduct } from "@/lib/catalog";
import { getBaseUrl } from "@/lib/app-url";
import { getPayOSClient, toPayOSOrderCode } from "@/lib/payos";
import { generateOrderDownloadLinks } from "@/lib/downloads";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const user = await getCurrentUser();
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const search = searchParams.get("search");

    const where: any = {};

    // If not admin, only return user's own orders
    if (!user || (user.role !== "ADMIN" && user.role !== "SUPER_ADMIN")) {
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
    type OrderWithRelations = (typeof orders)[number];
    type OrderItem = OrderWithRelations["items"][number];
    type OrderDownload = OrderWithRelations["downloads"][number];
    const sanitized = orders.map((order: OrderWithRelations) => ({
      ...order,
      items: order.items.map((item: OrderItem) => ({
        ...item,
        product: item.product ? sanitizeProduct(item.product) : null,
      })),
      downloads: order.downloads.map((dl: OrderDownload) => ({
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
    const { customerName, customerEmail, customerPhone, paymentMethod, items } = body;

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

      const productName = String(item.name || (product as any)?.name || item.id || "Sản phẩm").trim();
      const hasDownloadSource = Boolean(
        (product as any)?.fileKey || String((product as any)?.downloadLinkUrl || "").trim()
      );

      if (!product || !(product as any).active || !hasDownloadSource) {
        return NextResponse.json(
          { error: `Sản phẩm "${productName}" hiện chưa kinh doanh.` },
          { status: 400 }
        );
      }

      const unitPrice =
        typeof product.priceAfterDiscount === "number" &&
        !Number.isNaN(product.priceAfterDiscount)
          ? product.priceAfterDiscount
          : (product.price ?? 0);
      calculatedTotal += unitPrice * (item.quantity || 1);
      orderItemsData.push({
        productId: product.id,
        productName: product.name,
        price: unitPrice,
        quantity: item.quantity || 1,
      });
    }

    const orderNumber = generateOrderNumber();
    const isFreeOrder = calculatedTotal <= 0;

    if (isFreeOrder) {
      const order = await (prisma.order as any).create({
        data: {
          orderNumber,
          userId: user.id,
          customerName,
          customerEmail: customerEmail.toLowerCase().trim(),
          customerPhone: customerPhone || "",
          status: "PAID",
          total: calculatedTotal,
          paymentMethod: "FREE",
          paymentNote: "Đơn hàng 0đ - tự động cấp link tải",
          items: {
            create: orderItemsData,
          },
        },
        include: {
          items: true,
        },
      });

      const downloadLinks = await generateOrderDownloadLinks(order.id);

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
    }

    let payosOrderCode: number | null = null;
    let payosCheckoutUrl: string | null = null;
    let payosQrCode: string | null = null;

    try {
      const payos = await getPayOSClient();
      // ensure unique numeric orderCode
      for (let i = 0; i < 5; i++) {
        const candidate = toPayOSOrderCode(orderNumber) + i;
        const exists = await (prisma.order as any).findFirst({ where: { payosOrderCode: candidate } });
        if (!exists) {
          payosOrderCode = candidate;
          break;
        }
      }
      if (!payosOrderCode) payosOrderCode = Math.floor(Date.now() / 1000);

      const baseUrl = getBaseUrl(request);
      const paymentLink = await payos.paymentRequests.create({
        orderCode: payosOrderCode,
        amount: Math.round(calculatedTotal),
        description: orderNumber.slice(0, 25),
        returnUrl: `${baseUrl}/orders/created`, // will be redirected after creation via client using order.id; payOS requires valid URL
        cancelUrl: `${baseUrl}/checkout`,
      });
      payosCheckoutUrl = paymentLink.checkoutUrl || null;
      payosQrCode = paymentLink.qrCode || null;
    } catch (err) {
      console.error("payOS createPaymentLink error:", err);
      return NextResponse.json(
        { error: "Không thể tạo liên kết thanh toán payOS. Vui lòng kiểm tra cấu hình PAYOS_CLIENT_ID/PAYOS_API_KEY/PAYOS_CHECKSUM_KEY." },
        { status: 500 }
      );
    }

    const order = await (prisma.order as any).create({
      data: {
        orderNumber,
        payosOrderCode,
        payosCheckoutUrl,
        payosQrCode,
        userId: user.id,
        customerName,
        customerEmail: customerEmail.toLowerCase().trim(),
        customerPhone: customerPhone || "",
        status: "PENDING",
        total: calculatedTotal,
        paymentMethod: paymentMethod || "PAYOS",
        paymentNote: "Chờ thanh toán payOS",
        items: {
          create: orderItemsData,
        },
      },
      include: {
        items: true,
      },
    });

    return NextResponse.json({
      success: true,
      order: {
        ...order,
        downloadLinks: [],
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

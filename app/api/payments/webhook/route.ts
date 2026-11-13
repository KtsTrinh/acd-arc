import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateOrderDownloadLinks } from "@/lib/downloads";
import { sanitizeProduct } from "@/lib/catalog";
import { getSettings } from "@/lib/settings";

export const dynamic = "force-dynamic";

function getProvidedSecret(req: Request, body: any): string {
  const h = req.headers;
  const auth = h.get("authorization") || "";
  if (auth.toLowerCase().startsWith("bearer ")) return auth.slice(7).trim();
  return (
    h.get("x-webhook-secret") ||
    h.get("x-payment-webhook-secret") ||
    h.get("x-api-key") ||
    body?.secret ||
    body?.token ||
    ""
  );
}

function collectStrings(input: any, depth = 0): string[] {
  if (depth > 3 || input == null) return [];
  if (typeof input === "string" || typeof input === "number") return [String(input)];
  if (Array.isArray(input)) return input.flatMap((v) => collectStrings(v, depth + 1));
  if (typeof input === "object") {
    return Object.values(input).flatMap((v) => collectStrings(v, depth + 1));
  }
  return [];
}

function extractAmount(input: any, depth = 0): number | null {
  if (depth > 3 || input == null) return null;
  if (typeof input === "number" && Number.isFinite(input)) return input;
  if (typeof input === "string") {
    const n = Number(input.replace(/[^\d.-]/g, ""));
    return Number.isFinite(n) ? n : null;
  }
  if (Array.isArray(input)) {
    for (const v of input) {
      const n = extractAmount(v, depth + 1);
      if (n != null) return n;
    }
    return null;
  }
  if (typeof input === "object") {
    const priorityKeys = [
      "amount",
      "transferAmount",
      "transactionAmount",
      "creditAmount",
      "value",
      "money",
      "total",
    ];
    for (const k of priorityKeys) {
      if (k in input) {
        const n = extractAmount((input as any)[k], depth + 1);
        if (n != null) return n;
      }
    }
    for (const v of Object.values(input)) {
      const n = extractAmount(v, depth + 1);
      if (n != null) return n;
    }
  }
  return null;
}

async function findMatchingPendingOrder(body: any) {
  const texts = collectStrings(body).join(" \n ");
  const upper = texts.toUpperCase();
  const directId =
    body?.orderId || body?.order_id || body?.order?.id || body?.order?.orderNumber || null;
  const directNumber =
    body?.orderNumber ||
    body?.order_number ||
    body?.code ||
    body?.orderCode ||
    body?.order?.orderNumber ||
    null;

  if (directId) {
    const byId = await prisma.order.findFirst({
      where: { OR: [{ id: String(directId) }, { orderNumber: String(directId) }], status: "PENDING" },
      include: { items: true, downloads: true },
    });
    if (byId) return byId;
  }
  if (directNumber) {
    const byNo = await prisma.order.findFirst({
      where: { orderNumber: String(directNumber), status: "PENDING" },
      include: { items: true, downloads: true },
    });
    if (byNo) return byNo;
  }

  const pending = await prisma.order.findMany({
    where: { status: "PENDING" },
    include: { items: true, downloads: true },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  for (const o of pending) {
    if (o.orderNumber && upper.includes(String(o.orderNumber).toUpperCase())) return o;
    if (o.id && upper.includes(String(o.id).toUpperCase())) return o;
  }
  return null;
}

export async function POST(request: Request) {
  try {
    const settings = await getSettings();
    const expected = (settings.paymentWebhookSecret || process.env.PAYMENT_WEBHOOK_SECRET || "").trim();
    if (!expected) {
      return NextResponse.json(
        { error: "Chưa cấu hình payment webhook secret." },
        { status: 503 }
      );
    }

    let body: any = {};
    try {
      body = await request.json();
    } catch {
      body = {};
    }

    const provided = getProvidedSecret(request, body).trim();
    if (!provided || provided !== expected) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const order = await findMatchingPendingOrder(body);
    if (!order) {
      return NextResponse.json({ success: true, matched: false, message: "Không tìm thấy đơn PENDING khớp nội dung." });
    }

    const amount = extractAmount(body);
    if (amount != null && amount < (order.total || 0)) {
      return NextResponse.json(
        { success: false, matched: true, error: "Số tiền không khớp đơn hàng.", orderId: order.id },
        { status: 400 }
      );
    }

    const paid = await prisma.order.update({
      where: { id: order.id },
      data: {
        status: "PAID",
        paymentNote: "Thanh toán được xác nhận tự động qua webhook",
      },
      include: { items: true, downloads: true },
    });

    const downloadLinks = await generateOrderDownloadLinks(paid.id);

    return NextResponse.json({
      success: true,
      matched: true,
      order: {
        ...paid,
        downloads: downloadLinks.map((dl: any) => ({
          ...dl,
          product: dl.product ? sanitizeProduct(dl.product) : null,
        })),
      },
    });
  } catch (error) {
    console.error("Payment webhook error:", error);
    return NextResponse.json({ error: "Webhook xử lý thất bại." }, { status: 500 });
  }
}

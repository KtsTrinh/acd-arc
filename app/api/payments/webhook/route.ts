import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateOrderDownloadLinks } from "@/lib/downloads";
import { getPayOSClient } from "@/lib/payos";
import { WebhookError } from "@payos/node";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    let body: any = {};
    try {
      body = await request.json();
    } catch {
      // payOS confirm/test may send empty/invalid body; respond 200 to acknowledge endpoint
      return NextResponse.json({ success: true });
    }

    // payOS webhook test/confirmation: respond 200
    if (!body || (!body.data && !body.signature)) {
      return NextResponse.json({ success: true });
    }

    const payos = await getPayOSClient();

    let webhookData: any;
    try {
      webhookData = await payos.webhooks.verify(body);
    } catch (err) {
      if (err instanceof WebhookError) {
        console.warn("payOS webhook verify failed:", err.message);
        return NextResponse.json({ success: true });
      }
      throw err;
    }

    if (!webhookData) {
      return NextResponse.json({ success: true });
    }

    const isSuccess =
      String(webhookData.code) === "00" ||
      String((webhookData as any).desc || "").toLowerCase().includes("success");

    if (!isSuccess) {
      return NextResponse.json({ success: true });
    }

    const orderCode = Number(webhookData.orderCode);
    if (!Number.isFinite(orderCode)) {
      return NextResponse.json({ success: true });
    }

    const order = await (prisma.order as any).findFirst({
      where: { payosOrderCode: Math.floor(orderCode) },
      include: { items: true, downloads: true },
    });

    if (!order) {
      return NextResponse.json({ success: true });
    }

    if (order.status !== "PAID") {
      const paid = await (prisma.order as any).update({
        where: { id: order.id },
        data: {
          status: "PAID",
          paymentNote: "Thanh toán được xác nhận tự động qua payOS webhook",
        },
        include: { items: true, downloads: true },
      });
      await generateOrderDownloadLinks(paid.id);
    } else {
      // ensure links exist
      await generateOrderDownloadLinks(order.id);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("payOS webhook error:", error);
    // Always 200 so payOS does not retry endlessly on handler issues
    return NextResponse.json({ success: true });
  }
}
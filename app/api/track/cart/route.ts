import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { getClientIp, parseUserAgent } from "@/lib/tracking";

export const dynamic = "force-dynamic";

const ALLOWED_ACTIONS = new Set(["add", "remove", "clear", "checkout"]);

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const action = String(body.action || "add");
    const productId = body.productId ? String(body.productId) : null;
    const productName = String(body.productName || "Sản phẩm").slice(0, 200);
    const productSlug = body.productSlug ? String(body.productSlug) : null;
    const price = Number(body.price) || 0;

    if (!ALLOWED_ACTIONS.has(action)) {
      return NextResponse.json({ success: false }, { status: 400 });
    }

    const user = await getCurrentUser();
    const visitorId = cookies().get("acd_visitor")?.value || null;

    const session = visitorId
      ? await prisma.visitorSession.findUnique({
          where: { visitorId },
          select: { id: true },
        })
      : null;

    await prisma.cartEvent.create({
      data: {
        sessionId: session?.id ?? null,
        userId: user?.id ?? null,
        productId,
        productName,
        productSlug,
        price,
        action,
      },
    });

    // Cập nhật thông tin phiên để "khách đang truy cập" chính xác hơn
    if (session) {
      const { device, browser, os } = parseUserAgent(
        request.headers.get("user-agent")
      );

      await prisma.visitorSession.update({
        where: { id: session.id },
        data: {
          userId: user?.id ?? undefined,
          ip: getClientIp(request),
          device,
          browser,
          os,
          lastSeenAt: new Date(),
        },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Cart track error:", error);
    return NextResponse.json({ success: false }, { status: 200 });
  }
}

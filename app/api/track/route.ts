import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import {
  VISITOR_COOKIE_MAX_AGE,
  VISITOR_COOKIE_NAME,
  createVisitorId,
  getClientIp,
  parseUserAgent,
} from "@/lib/tracking";

export const dynamic = "force-dynamic";

type TrackType = "pageview" | "duration" | "heartbeat";

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const type = (String(body.type || "pageview") as TrackType);
    const path = String(body.path || "/").slice(0, 300);
    const referrer = body.referrer ? String(body.referrer).slice(0, 500) : null;
    const durationSec = Math.min(
      3600,
      Math.max(0, Math.round(Number(body.durationSec) || 0))
    );

    const ip = getClientIp(request);
    const userAgent = request.headers.get("user-agent") || null;
    const { device, browser, os } = parseUserAgent(userAgent);
    const user = await getCurrentUser();

    // Không ghi nhận lượt truy cập của chính quản trị viên
    if (user?.role === "ADMIN") {
      return NextResponse.json({ success: true, skipped: true });
    }

    const cookieStore = cookies();
    let visitorId = cookieStore.get(VISITOR_COOKIE_NAME)?.value;
    const isNewVisitor = !visitorId;

    if (!visitorId) {
      visitorId = createVisitorId();
    }

    const now = new Date();

    const session = await prisma.visitorSession.upsert({
      where: { visitorId },
      create: {
        visitorId,
        userId: user?.id ?? null,
        ip,
        userAgent,
        device,
        browser,
        os,
        referrer,
        landingPath: path,
        lastPath: path,
        pageViews: type === "pageview" ? 1 : 0,
        durationSec,
        firstSeenAt: now,
        lastSeenAt: now,
      },
      update: {
        userId: user?.id ?? undefined,
        ip,
        userAgent,
        device,
        browser,
        os,
        lastPath: type === "heartbeat" ? undefined : path,
        pageViews: type === "pageview" ? { increment: 1 } : undefined,
        durationSec: durationSec > 0 ? { increment: durationSec } : undefined,
        lastSeenAt: now,
      },
    });

    if (type === "pageview") {
      // Gán thời gian ở lại cho lần xem trang trước đó
      if (durationSec > 0) {
        const previous = await prisma.pageView.findFirst({
          where: { sessionId: session.id },
          orderBy: { createdAt: "desc" },
        });

        if (previous && previous.path !== path) {
          await prisma.pageView.update({
            where: { id: previous.id },
            data: { durationSec: { increment: durationSec } },
          });
        }
      }

      await prisma.pageView.create({
        data: {
          sessionId: session.id,
          userId: user?.id ?? null,
          path,
          referrer,
          durationSec: 0,
        },
      });
    } else if (durationSec > 0) {
      // Đóng tab: ghi thời gian ở lại của trang hiện tại
      const last = await prisma.pageView.findFirst({
        where: { sessionId: session.id },
        orderBy: { createdAt: "desc" },
      });

      if (last && last.path === path) {
        await prisma.pageView.update({
          where: { id: last.id },
          data: { durationSec: { increment: durationSec } },
        });
      }
    }

    const response = NextResponse.json({ success: true });

    if (isNewVisitor) {
      response.cookies.set(VISITOR_COOKIE_NAME, visitorId, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: VISITOR_COOKIE_MAX_AGE,
        path: "/",
      });
    }

    return response;
  } catch (error) {
    console.error("Track error:", error);
    return NextResponse.json({ success: false }, { status: 200 });
  }
}

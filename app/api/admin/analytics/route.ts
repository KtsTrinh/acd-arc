import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { LIVE_WINDOW_SECONDS } from "@/lib/tracking";

export const dynamic = "force-dynamic";

function getRangeStart(range: string | null): Date | null {
  const now = new Date();

  if (range === "today") {
    const start = new Date(now);
    start.setHours(0, 0, 0, 0);
    return start;
  }

  if (range === "7d") {
    const start = new Date(now);
    start.setDate(start.getDate() - 7);
    return start;
  }

  if (range === "30d") {
    const start = new Date(now);
    start.setDate(start.getDate() - 30);
    return start;
  }

  return null;
}

export async function GET(request: Request) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser || currentUser.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const range = searchParams.get("range") || "7d";
    const search = (searchParams.get("search") || "").trim().toLowerCase();

    const rangeStart = getRangeStart(range);
    const now = new Date();
    const liveSince = new Date(now.getTime() - LIVE_WINDOW_SECONDS * 1000);
    const todayStart = new Date(now);
    todayStart.setHours(0, 0, 0, 0);

    const sessionWhere: any = {};
    if (rangeStart) sessionWhere.firstSeenAt = { gte: rangeStart };

    const [
      liveSessions,
      sessions,
      todayViews,
      todaySessionCount,
      totalSessions,
      totalViews,
      users,
      orders,
      cartAddEvents,
      pageViews,
    ] = await Promise.all([
      prisma.visitorSession.findMany({
        where: { lastSeenAt: { gte: liveSince } },
        include: { user: { select: { id: true, name: true, email: true, phone: true, address: true } } },
        orderBy: { lastSeenAt: "desc" },
        take: 100,
      }),
      prisma.visitorSession.findMany({
        where: sessionWhere,
        include: { user: { select: { id: true, name: true, email: true, phone: true, address: true } } },
        orderBy: { lastSeenAt: "desc" },
        take: 300,
      }),
      prisma.pageView.count({ where: { createdAt: { gte: todayStart } } }),
      prisma.visitorSession.count({ where: { firstSeenAt: { gte: todayStart } } }),
      prisma.visitorSession.count(),
      prisma.pageView.count(),
      prisma.user.findMany({
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          address: true,
          avatar: true,
          provider: true,
          role: true,
          createdAt: true,
          orders: {
            select: { id: true, orderNumber: true, total: true, status: true, createdAt: true },
            orderBy: { createdAt: "desc" },
          },
          visitSessions: {
            select: { pageViews: true, durationSec: true, firstSeenAt: true, lastSeenAt: true },
          },
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.order.findMany({
        select: {
          id: true,
          orderNumber: true,
          customerName: true,
          customerEmail: true,
          customerPhone: true,
          total: true,
          status: true,
          createdAt: true,
          userId: true,
          items: { select: { productName: true, price: true, quantity: true } },
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.cartEvent.findMany({
        where: { action: "add" },
        select: {
          id: true,
          productId: true,
          productName: true,
          productSlug: true,
          price: true,
          userId: true,
          sessionId: true,
          createdAt: true,
        },
        orderBy: { createdAt: "desc" },
        take: 2000,
      }),
      prisma.pageView.findMany({
        select: { path: true, durationSec: true, createdAt: true },
        where: rangeStart ? { createdAt: { gte: rangeStart } } : undefined,
        take: 5000,
      }),
    ]);

    /* ---------------- Lịch sử truy cập (khách đã truy cập) ---------------- */
    const sessionRows = sessions
      .map((s) => ({
        id: s.id,
        visitorId: s.visitorId,
        lastPath: s.lastPath,
        landingPath: s.landingPath,
        device: s.device,
        browser: s.browser,
        os: s.os,
        ip: s.ip,
        pageViews: s.pageViews,
        durationSec: s.durationSec,
        firstSeenAt: s.firstSeenAt,
        lastSeenAt: s.lastSeenAt,
        isLive: s.lastSeenAt >= liveSince,
        user: s.user
          ? {
              id: s.user.id,
              name: s.user.name,
              email: s.user.email,
              phone: s.user.phone,
            }
          : null,
      }))
      .filter((row) => {
        if (!search) return true;
        return (
          row.visitorId.toLowerCase().includes(search) ||
          (row.lastPath || "").toLowerCase().includes(search) ||
          (row.user?.email || "").toLowerCase().includes(search) ||
          (row.user?.name || "").toLowerCase().includes(search) ||
          (row.ip || "").includes(search)
        );
      });

    /* ---------------- Thông tin từng khách hàng đã đăng ký ---------------- */
    const customerRows = users
      .map((u) => {
        const visits = u.visitSessions.length;
        const pageViews = u.visitSessions.reduce((sum, v) => sum + v.pageViews, 0);
        const durationSec = u.visitSessions.reduce((sum, v) => sum + v.durationSec, 0);
        const lastVisitAt = u.visitSessions.reduce<Date | null>(
          (latest, v) => (!latest || v.lastSeenAt > latest ? v.lastSeenAt : latest),
          null
        );
        const totalSpent = u.orders
          .filter((o) => o.status === "PAID")
          .reduce((sum, o) => sum + o.total, 0);
        const lastOrderAt = u.orders.length ? u.orders[0].createdAt : null;
        const cartAdds = cartAddEvents.filter((c) => c.userId === u.id).length;

        return {
          id: u.id,
          name: u.name,
          email: u.email,
          phone: u.phone,
          address: u.address,
          avatar: u.avatar,
          provider: u.provider,
          role: u.role,
          createdAt: u.createdAt,
          visits,
          pageViews,
          durationSec,
          lastVisitAt,
          orderCount: u.orders.length,
          paidCount: u.orders.filter((o) => o.status === "PAID").length,
          totalSpent,
          lastOrderAt,
          cartAdds,
        };
      })
      .filter((row) => {
        if (!search) return true;
        return (
          (row.email || "").toLowerCase().includes(search) ||
          (row.name || "").toLowerCase().includes(search) ||
          (row.phone || "").toLowerCase().includes(search)
        );
      });

    /* ---------------- Đơn hàng khách từng mua ---------------- */
    const buyerMap = new Map<
      string,
      {
        email: string;
        name: string;
        phone: string;
        orderCount: number;
        paidCount: number;
        totalSpent: number;
        lastOrderAt: string;
        items: { name: string; quantity: number; price: number }[];
      }
    >();

    for (const order of orders) {
      const key = (order.customerEmail || order.userId || order.id).toLowerCase();

      if (!buyerMap.has(key)) {
        buyerMap.set(key, {
          email: order.customerEmail,
          name: order.customerName,
          phone: order.customerPhone || "",
          orderCount: 0,
          paidCount: 0,
          totalSpent: 0,
          lastOrderAt: order.createdAt.toISOString(),
          items: [],
        });
      }

      const buyer = buyerMap.get(key)!;
      buyer.orderCount += 1;
      if (order.status === "PAID") {
        buyer.paidCount += 1;
        buyer.totalSpent += order.total;
      }
      if (order.createdAt.toISOString() > buyer.lastOrderAt) {
        buyer.lastOrderAt = order.createdAt.toISOString();
      }
      order.items.forEach((item) => {
        const existing = buyer.items.find((i) => i.name === item.productName);
        if (existing) existing.quantity += item.quantity;
        else
          buyer.items.push({
            name: item.productName,
            quantity: item.quantity,
            price: item.price,
          });
      });
    }

    const buyers = Array.from(buyerMap.values())
      .sort((a, b) => b.totalSpent - a.totalSpent)
      .filter((buyer) => {
        if (!search) return true;
        return (
          (buyer.email || "").toLowerCase().includes(search) ||
          (buyer.name || "").toLowerCase().includes(search)
        );
      });

    /* ---------------- Sản phẩm khách cho vào giỏ ---------------- */
    const cartMap = new Map<
      string,
      {
        productId: string;
        productName: string;
        productSlug: string;
        price: number;
        adds: number;
        visitors: Set<string>;
        potentialValue: number;
      }
    >();

    for (const event of cartAddEvents) {
      const key = event.productId || event.productName;
      if (!cartMap.has(key)) {
        cartMap.set(key, {
          productId: event.productId || "",
          productName: event.productName,
          productSlug: event.productSlug || "",
          price: event.price,
          adds: 0,
          visitors: new Set<string>(),
          potentialValue: 0,
        });
      }

      const row = cartMap.get(key)!;
      row.adds += 1;
      row.potentialValue += event.price;
      row.visitors.add(event.userId || event.sessionId || "unknown");
    }

    const cartTop = Array.from(cartMap.values())
      .map((row) => ({
        productId: row.productId,
        productName: row.productName,
        productSlug: row.productSlug,
        price: row.price,
        adds: row.adds,
        visitors: row.visitors.size,
        potentialValue: row.potentialValue,
      }))
      .sort((a, b) => b.adds - a.adds)
      .slice(0, 20);

    const cartRecent = await prisma.cartEvent.findMany({
      where: { action: "add" },
      include: {
        user: { select: { id: true, name: true, email: true, phone: true, address: true } },
        session: { select: { visitorId: true, device: true, browser: true, os: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 30,
    });

    /* ---------------- Trang được xem nhiều ---------------- */
    const pageMap = new Map<
      string,
      { path: string; views: number; durationTotal: number; durationCount: number }
    >();

    for (const view of pageViews) {
      if (!pageMap.has(view.path)) {
        pageMap.set(view.path, {
          path: view.path,
          views: 0,
          durationTotal: 0,
          durationCount: 0,
        });
      }
      const row = pageMap.get(view.path)!;
      row.views += 1;
      if (view.durationSec > 0) {
        row.durationTotal += view.durationSec;
        row.durationCount += 1;
      }
    }

    const topPages = Array.from(pageMap.values())
      .map((row) => ({
        path: row.path,
        views: row.views,
        avgDurationSec:
          row.durationCount > 0
            ? Math.round(row.durationTotal / row.durationCount)
            : 0,
      }))
      .sort((a, b) => b.views - a.views)
      .slice(0, 15);

    /* ---------------- Chỉ số tổng quan ---------------- */
    const liveVisitors = new Set(
      liveSessions.map((s) => s.userId || s.visitorId)
    ).size;

    const totalDuration = sessions.reduce((sum, s) => sum + s.durationSec, 0);
    const avgDurationSec = sessions.length
      ? Math.round(totalDuration / sessions.length)
      : 0;

    const paidOrders = orders.filter((o) => o.status === "PAID");
    const revenue = paidOrders.reduce((sum, o) => sum + o.total, 0);
    const conversionRate = totalSessions
      ? Number(((orders.length / totalSessions) * 100).toFixed(2))
      : 0;

    return NextResponse.json({
      stats: {
        liveVisitors,
        liveSessions: liveSessions.length,
        todayViews,
        todayVisitors: todaySessionCount,
        totalVisitors: totalSessions,
        totalViews,
        avgDurationSec,
        registeredCustomers: users.filter((u) => u.role === "USER").length,
        cartAdds: cartAddEvents.length,
        orders: orders.length,
        revenue,
        conversionRate,
      },
      live: liveSessions.map((s) => ({
        id: s.id,
        visitorId: s.visitorId,
        lastPath: s.lastPath,
        device: s.device,
        browser: s.browser,
        os: s.os,
        ip: s.ip,
        pageViews: s.pageViews,
        durationSec: s.durationSec,
        firstSeenAt: s.firstSeenAt,
        lastSeenAt: s.lastSeenAt,
        user: s.user,
      })),
      sessions: sessionRows,
      customers: customerRows,
      buyers,
      cartTop,
      cartRecent: cartRecent.map((event) => ({
        id: event.id,
        productName: event.productName,
        productSlug: event.productSlug,
        price: event.price,
        action: event.action,
        createdAt: event.createdAt,
        visitorId: event.session?.visitorId || null,
        device: event.session?.device || null,
        user: event.user,
      })),
      topPages,
    });
  } catch (error) {
    console.error("Error fetching analytics:", error);
    return NextResponse.json(
      { error: "Không thể lấy dữ liệu khách hàng." },
      { status: 500 }
    );
  }
}

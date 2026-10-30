import React from "react";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatVND, formatDateTime } from "@/lib/utils";
import {
  Building2,
  Package,
  ShoppingBag,
  TrendingUp,
  ArrowRight,
  CheckCircle2,
  Clock,
  ExternalLink,
  PieChart as PieChartIcon,
  LineChart as LineChartIcon,
} from "lucide-react";

export const revalidate = 0;

function RevenueLineChart({ data }: { data: { name: string; revenue: number; count: number }[] }) {
  const maxRevenue = Math.max(...data.map((d) => d.revenue), 1);
  const width = 360;
  const height = 200;
  const padding = { top: 20, right: 20, bottom: 30, left: 40 };
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;

  type Point = { x: number; y: number; d: { name: string; revenue: number; count: number } };
  const points: Point[] = data.map((d, i) => ({
    x: padding.left + (i / Math.max(data.length - 1, 1)) * chartWidth,
    y: padding.top + chartHeight - (d.revenue / maxRevenue) * chartHeight,
    d,
  }));

  const pathStr = points
    .map((p, i) => (i === 0 ? `M ${p.x} ${p.y}` : `L ${p.x} ${p.y}`))
    .join(" ");

  const dots = points.map((p) => `<circle cx="${p.x}" cy="${p.y}" r="3" fill="#087EA4" />`).join("");

  const yTicks = [0, maxRevenue / 2, maxRevenue].map((v, i) => {
    const y = padding.top + chartHeight - (v / maxRevenue) * chartHeight;
    return (
      <line
        key={i}
        x1={padding.left}
        y1={y}
        x2={width - padding.right}
        y2={y}
        stroke="#E1EAF2"
        strokeDasharray="3 3"
      />
    );
  });

  return (
    <div className="w-full h-full">
      <svg width={width} height={height} className="w-full h-full">
        <defs>
          <linearGradient id="grad-revenue" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#087EA4" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#087EA4" stopOpacity="0" />
          </linearGradient>
        </defs>
        {yTicks}
        <path
          d={`M ${points[0].x} ${points[0].y} L ${points[points.length - 1].x} ${points[points.length - 1].y} L ${points[points.length - 1].x} ${padding.top + chartHeight} L ${points[0].x} ${padding.top + chartHeight} Z`}
          fill="url(#grad-revenue)"
        />
        <path d={pathStr} fill="none" stroke="#087EA4" strokeWidth={2} />
        {data.map((d, i) => (
          <text
            key={i}
            x={points[i].x}
            y={padding.top + chartHeight + 20}
            textAnchor="middle"
            fontSize="10"
            fill="#526780"
          >
            {d.name}
          </text>
        ))}
        {data.map((d, i) => (
          <text
            key={`v${i}`}
            x={points[i].x}
            y={points[i].y - 6}
            textAnchor="middle"
            fontSize="10"
            fill="#087EA4"
            fontWeight="600"
          >
            {d.revenue > 0 ? formatVND(d.revenue) : ""}
          </text>
        ))}
      </svg>
    </div>
  );
}

function StatusDonutChart({ paidCount, pendingCount }: { paidCount: number; pendingCount: number }) {
  const total = paidCount + pendingCount;
  const paidAngle = total === 0 ? 0 : (paidCount / total) * 360;
  const pendingAngle = total === 0 ? 0 : (pendingCount / total) * 360;

  const cx = 100;
  const cy = 100;
  const outerR = 70;
  const innerR = 45;

  const polarToCartesian = (centerX: number, centerY: number, radius: number, angleInDegrees: number) => {
    const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180.0;
    return {
      x: centerX + radius * Math.cos(angleInRadians),
      y: centerY + radius * Math.sin(angleInRadians),
    };
  };

  const describeArc = (x: number, y: number, radius: number, startAngle: number, endAngle: number) => {
    const start = polarToCartesian(x, y, radius, endAngle);
    const end = polarToCartesian(x, y, radius, startAngle);
    const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";
    const d = [
      "M",
      start.x,
      start.y,
      "A",
      radius,
      radius,
      0,
      largeArcFlag,
      0,
      end.x,
      end.y,
    ].join(" ");
    return d;
  };

  const paidPath = describeArc(cx, cy, outerR, 0, paidAngle);
  const pendingPath = describeArc(cx, cy, outerR, paidAngle, paidAngle + pendingAngle);

  return (
    <div className="w-full h-full flex items-center justify-center">
      <svg width={200} height={200} className="w-48 h-48">
        {paidAngle > 0 && (
          <path
            d={paidPath}
            fill="none"
            stroke="#10B981"
            strokeWidth={14}
            strokeLinecap="round"
          />
        )}
        {pendingAngle > 0 && (
          <path
            d={pendingPath}
            fill="none"
            stroke="#F59E0B"
            strokeWidth={14}
            strokeLinecap="round"
          />
        )}
        <circle cx={cx} cy={cy} r={innerR} fill="#fff" />
        <text x={cx} y={cy - 8} textAnchor="middle" fontSize="16" fontWeight="700" fill="#142338">
          {total}
        </text>
        <text x={cx} y={cy + 10} textAnchor="middle" fontSize="11" fill="#526780">
          đơn hàng
        </text>
      </svg>
      <div className="ml-4 space-y-2">
        <div className="flex items-center gap-2 text-xs">
          <span className="w-3 h-3 rounded-full bg-[#10B981]" />
          <span className="text-[#526780]">Đã thanh toán: {paidCount}</span>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <span className="w-3 h-3 rounded-full bg-[#F59E0B]" />
          <span className="text-[#526780]">Chờ xử lý: {pendingCount}</span>
        </div>
      </div>
    </div>
  );
}

export default async function AdminDashboardPage() {
  const now = new Date();
  const sevenDaysAgo = new Date(now);
  sevenDaysAgo.setDate(now.getDate() - 7);

  const [projectCount, productCount, orderCount, mediaCount, recentOrders, paidOrders, ordersByDay] = await Promise.all([
    prisma.project.count(),
    prisma.product.count(),
    prisma.order.count(),
    prisma.media.count(),
    prisma.order.findMany({
      take: 6,
      orderBy: { createdAt: "desc" },
      include: {
        items: true,
        downloads: true,
      },
    }),
    prisma.order.findMany({
      where: { status: "PAID" },
      select: { total: true, createdAt: true },
    }),
    prisma.order.findMany({
      where: { createdAt: { gte: sevenDaysAgo } },
      select: { total: true, status: true, createdAt: true },
      orderBy: { createdAt: "asc" },
    }),
  ]);

  const totalRevenue = paidOrders.reduce((sum, o) => sum + o.total, 0);

  const paidCount = ordersByDay.filter((o) => o.status === "PAID").length;
  const pendingCount = ordersByDay.filter((o) => o.status !== "PAID").length;

  // Group orders by day for last 7 days
  const dayLabels = ["CN", "Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7"];
  const dayData = dayLabels.map((label, i) => {
    const targetDate = new Date(now);
    targetDate.setDate(now.getDate() - (6 - i));
    targetDate.setHours(0, 0, 0, 0);
    const nextDay = new Date(targetDate);
    nextDay.setDate(nextDay.getDate() + 1);

    const dayOrders = ordersByDay.filter((o) => {
      const d = new Date(o.createdAt);
      return d >= targetDate && d < nextDay;
    });
    const revenue = dayOrders.reduce((sum, o) => sum + (o.status === "PAID" ? o.total : 0), 0);
    const count = dayOrders.length;

    return { name: label, revenue, count };
  });

  const stats = [
    {
      label: "Dự Án Kiến Trúc",
      value: projectCount,
      icon: Building2,
      sub: "Công trình & Portfolio",
      href: "/admin/catalog?tab=MANAGE",
    },
    {
      label: "Danh Mục Sản Phẩm",
      value: productCount,
      icon: Package,
      sub: "Kiến trúc · Nội thất · Xây dựng · File",
      href: "/admin/catalog",
    },
    {
      label: "Đơn Hàng",
      value: orderCount,
      icon: ShoppingBag,
      sub: "Lịch sử mua tài nguyên",
      href: "/admin/orders",
    },
    {
      label: "Doanh Thu Đã Thu",
      value: formatVND(totalRevenue),
      icon: TrendingUp,
      sub: "Thanh toán thành công",
      href: "/admin/orders",
    },
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display font-bold text-2xl sm:text-3xl text-[#142338]">Dashboard Tổng Quan</h1>
          <p className="text-sm text-[#526780] mt-1">Hệ thống quản trị kiến trúc ACD: Portfolio, Media Library dùng chung & Thương mại điện tử</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s, idx) => {
          const Icon = s.icon;
          return (
            <Link
              key={idx}
              href={s.href}
              className="group p-5 rounded-xl bg-white border border-[#E1EAF2] hover:border-[#22C7E8]/60 hover:shadow-[0_4px_20px_rgba(8,126,164,0.08)] transition-all duration-200 flex flex-col justify-between gap-4"
            >
              <div className="flex items-center justify-between">
                <span className="text-sm text-[#526780] font-medium">{s.label}</span>
                <div className="p-2 rounded-lg bg-[#E8FAFE] border border-[#22C7E8]/20">
                  <Icon className="w-4 h-4 text-[#087EA4]" />
                </div>
              </div>
              <div>
                <span className="font-display font-bold text-2xl sm:text-3xl text-[#142338] block">{s.value}</span>
                <span className="text-xs text-[#8192A8] mt-1 block">{s.sub}</span>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Biểu đồ */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Doanh thu 7 ngày */}
        <div className="rounded-xl bg-white border border-[#E1EAF2] overflow-hidden shadow-sm">
          <div className="p-5 border-b border-[#E1EAF2]">
            <div className="flex items-center gap-2">
              <LineChartIcon className="w-4 h-4 text-[#087EA4]" />
              <h2 className="font-semibold text-base text-[#142338]">Doanh Thu 7 Ngày Gần Đây</h2>
            </div>
            <p className="text-xs text-[#526780] mt-1">Tổng đơn đã thanh toán theo ngày</p>
          </div>
          <div className="p-4">
            <RevenueLineChart data={dayData} />
          </div>
        </div>

        {/* Đơn hàng theo trạng thái */}
        <div className="rounded-xl bg-white border border-[#E1EAF2] overflow-hidden shadow-sm">
          <div className="p-5 border-b border-[#E1EAF2]">
            <div className="flex items-center gap-2">
              <PieChartIcon className="w-4 h-4 text-[#087EA4]" />
              <h2 className="font-semibold text-base text-[#142338]">Đơn Hàng Theo Trạng Thái</h2>
            </div>
            <p className="text-xs text-[#526780] mt-1">7 ngày gần đây</p>
          </div>
          <div className="p-4">
            <StatusDonutChart paidCount={paidCount} pendingCount={pendingCount} />
          </div>
        </div>
      </div>

      <div className="rounded-xl bg-white border border-[#E1EAF2] overflow-hidden shadow-sm">
        <div className="p-5 border-b border-[#E1EAF2] flex items-center justify-between">
          <div>
            <h2 className="font-semibold text-base text-[#142338]">Đơn Hàng Gần Đây</h2>
            <p className="text-xs text-[#526780] mt-1">Kiểm tra trạng thái đơn hàng và các liên kết tải tài nguyên đã sinh</p>
          </div>
          <Link href="/admin/orders" className="text-xs text-[#087EA4] hover:text-[#22C7E8] font-medium flex items-center gap-1 transition-colors">
            <span>Xem tất cả</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-[#F7FAFD] text-[#526780] uppercase font-medium text-[11px] tracking-wider border-b border-[#E1EAF2]">
              <tr>
                <th className="py-3 px-5">Mã Đơn</th>
                <th className="py-3 px-5">Khách Hàng</th>
                <th className="py-3 px-5">Sản Phẩm</th>
                <th className="py-3 px-5">Tổng Tiền</th>
                <th className="py-3 px-5">Trạng Thái</th>
                <th className="py-3 px-5">Quyền Tải</th>
                <th className="py-3 px-5 text-right">Chi Tiết</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E1EAF2]">
              {recentOrders.map((o) => (
                <tr key={o.id} className="hover:bg-[#F7FAFD] transition-colors">
                  <td className="py-3.5 px-5 font-mono font-semibold text-[#142338]">#{o.orderNumber}</td>
                  <td className="py-3.5 px-5">
                    <p className="font-medium text-[#142338]">{o.customerName}</p>
                    <p className="text-xs text-[#8192A8]">{o.customerEmail}</p>
                  </td>
                  <td className="py-3.5 px-5 text-[#526780]">{o.items.length} sản phẩm</td>
                  <td className="py-3.5 px-5 font-semibold text-[#087EA4]">{formatVND(o.total)}</td>
                  <td className="py-3.5 px-5">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${
                        o.status === "PAID"
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                          : "bg-amber-50 text-amber-700 border-amber-200"
                      }`}
                    >
                      {o.status === "PAID" ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Clock className="w-3.5 h-3.5" />}
                      <span>{o.status === "PAID" ? "Đã thanh toán" : o.status}</span>
                    </span>
                  </td>
                  <td className="py-3.5 px-5">
                    {o.downloads.length > 0 ? (
                      <span className="text-emerald-700 font-medium">{o.downloads.length} Token hoạt động</span>
                    ) : (
                      <span className="text-[#8192A8]">Chưa cấp</span>
                    )}
                  </td>
                  <td className="py-3.5 px-5 text-right">
                    <Link
                      href={`/orders/${o.id}`}
                      target="_blank"
                      className="p-1.5 rounded-lg hover:bg-[#E8FAFE] text-[#8192A8] hover:text-[#087EA4] inline-flex items-center transition-colors"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

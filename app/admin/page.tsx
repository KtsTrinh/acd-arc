import React, { useState } from "react";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatVND, formatDateTime } from "@/lib/utils";
import {
  Building2,
  Package,
  ShoppingBag,
  TrendingUp,
  ArrowRight,
  Image as ImageIcon,
  CheckCircle2,
  Clock,
  ExternalLink,
  PieChart as PieChartIcon,
  LineChart as LineChartIcon,
  BarChart as BarChartIcon,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

export const revalidate = 0;

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
          <div className="p-4 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={dayData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E1EAF2" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#526780" }} axisLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "#526780" }} axisLine={false} />
                <Tooltip formatter={(value) => formatVND(value)} />
                <Legend verticalAlign="top" align="right" height={30} />
                <Line type="monotone" dataKey="revenue" stroke="#087EA4" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
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
          <div className="p-4 h-64 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={[
                    { name: "Đã thanh toán", value: paidCount, fill: "#10B981" },
                    { name: "Chờ xử lý", value: pendingCount, fill: "#F59E0B" },
                  ]}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  innerRadius={40}
                  stroke="#fff"
                  strokeWidth={2}
                  label
                />
                <Tooltip formatter={(value) => `${value} đơn`} />
                <Legend verticalAlign="top" align="center" />
              </PieChart>
            </ResponsiveContainer>
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

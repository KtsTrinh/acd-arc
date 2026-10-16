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
  Plus,
  Image as ImageIcon,
  CheckCircle2,
  Clock,
  ExternalLink,
} from "lucide-react";

export const revalidate = 0;

export default async function AdminDashboardPage() {
  const [
    projectCount,
    productCount,
    orderCount,
    mediaCount,
    recentOrders,
    paidOrders,
  ] = await Promise.all([
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
      select: { total: true },
    }),
  ]);

  const totalRevenue = paidOrders.reduce((sum, o) => sum + o.total, 0);

  const stats = [
    {
      label: "Dự Án Kiến Trúc",
      value: projectCount,
      icon: Building2,
      sub: "Công trình & Portfolio",
      href: "/admin/projects",
      color: "text-thuy-400",
    },
    {
      label: "Sản Phẩm & Tài Nguyên",
      value: productCount,
      icon: Package,
      sub: "Bản vẽ CAD & Model 3D",
      href: "/admin/products",
      color: "text-aqua-400",
    },
    {
      label: "Đơn Hàng",
      value: orderCount,
      icon: ShoppingBag,
      sub: "Lịch sử mua tài nguyên",
      href: "/admin/orders",
      color: "text-amber-400",
    },
    {
      label: "Doanh Thu Đã Thu",
      value: formatVND(totalRevenue),
      icon: TrendingUp,
      sub: "Thanh toán thành công",
      href: "/admin/orders",
      color: "text-emerald-400",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Page Title & Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display font-bold text-2xl sm:text-3xl text-white">
            Dashboard Tổng Quan
          </h1>
          <p className="text-xs text-slate-400">
            Hệ thống quản trị kiến trúc ACD: Portfolio, Media Library dùng chung & Thương mại điện tử
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Link
            href="/admin/projects/new"
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-thuy-400 text-thuy-950 font-bold text-xs hover:brightness-110 shadow-glow-cyan transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Thêm Dự Án Mới</span>
          </Link>

          <Link
            href="/admin/media"
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-thuy-800 text-slate-200 hover:text-white hover:bg-thuy-750 border border-thuy-700 text-xs font-semibold transition-all"
          >
            <ImageIcon className="w-3.5 h-3.5 text-thuy-400" />
            <span>Upload Media</span>
          </Link>
        </div>
      </div>

      {/* 4 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {stats.map((s, idx) => {
          const Icon = s.icon;
          return (
            <Link
              key={idx}
              href={s.href}
              className="p-5 rounded-2xl bg-thuy-850/90 border border-thuy-750 hover:border-thuy-500 transition-all duration-200 hover:shadow-card-dark flex flex-col justify-between space-y-4"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-400">{s.label}</span>
                <div className="p-2 rounded-xl bg-thuy-900 border border-thuy-700">
                  <Icon className={`w-4 h-4 ${s.color}`} />
                </div>
              </div>

              <div>
                <span className="font-display font-extrabold text-2xl sm:text-3xl text-white block">
                  {s.value}
                </span>
                <span className="text-[11px] text-slate-400 mt-1 block">{s.sub}</span>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Recent Orders Section */}
      <div className="rounded-2xl bg-thuy-850 border border-thuy-750 overflow-hidden">
        <div className="p-5 border-b border-thuy-750 flex items-center justify-between">
          <div>
            <h2 className="font-semibold text-base text-white">Đơn Hàng Gần Đây</h2>
            <p className="text-xs text-slate-400">
              Kiểm tra trạng thái đơn hàng và các liên kết tải tài nguyên đã sinh
            </p>
          </div>
          <Link
            href="/admin/orders"
            className="text-xs text-thuy-400 hover:text-white font-medium flex items-center gap-1 transition-colors"
          >
            <span>Xem tất cả</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-thuy-900/80 text-slate-400 uppercase font-semibold text-[10px] tracking-wider border-b border-thuy-750">
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
            <tbody className="divide-y divide-thuy-750/60">
              {recentOrders.map((o) => (
                <tr key={o.id} className="hover:bg-thuy-800/40 transition-colors">
                  <td className="py-3.5 px-5 font-mono font-bold text-white">
                    #{o.orderNumber}
                  </td>
                  <td className="py-3.5 px-5">
                    <p className="font-medium text-slate-200">{o.customerName}</p>
                    <p className="text-[10px] text-slate-400">{o.customerEmail}</p>
                  </td>
                  <td className="py-3.5 px-5 text-slate-300">
                    {o.items.length} sản phẩm
                  </td>
                  <td className="py-3.5 px-5 font-bold text-thuy-400">
                    {formatVND(o.total)}
                  </td>
                  <td className="py-3.5 px-5">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        o.status === "PAID"
                          ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                          : "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                      }`}
                    >
                      {o.status === "PAID" ? (
                        <CheckCircle2 className="w-3 h-3" />
                      ) : (
                        <Clock className="w-3 h-3" />
                      )}
                      <span>{o.status}</span>
                    </span>
                  </td>
                  <td className="py-3.5 px-5">
                    {o.downloads.length > 0 ? (
                      <span className="text-emerald-400 font-medium">
                        {o.downloads.length} Token Active
                      </span>
                    ) : (
                      <span className="text-slate-500">Chưa cấp</span>
                    )}
                  </td>
                  <td className="py-3.5 px-5 text-right">
                    <Link
                      href={`/orders/${o.id}`}
                      target="_blank"
                      className="p-1.5 rounded-lg bg-thuy-800 hover:bg-thuy-700 text-slate-300 hover:text-white inline-flex items-center gap-1"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
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


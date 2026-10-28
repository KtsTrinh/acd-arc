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
  const [projectCount, productCount, orderCount, mediaCount, recentOrders, paidOrders] = await Promise.all([
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

        <div className="flex flex-wrap items-center gap-2.5">
          <Link
            href="/admin/projects/new"
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-gradient-to-r from-[#087EA4] to-[#22C7E8] text-[#142338] font-medium text-xs hover:shadow-[0_4px_16px_rgba(34,199,232,0.25)] transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Thêm Dự Án Mới</span>
          </Link>

          <Link
            href="/admin/media"
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-white text-[#142338] border border-[#E1EAF2] text-xs font-medium hover:border-[#22C7E8] hover:text-[#087EA4] transition-all"
          >
            <ImageIcon className="w-4 h-4" />
            <span>Upload Media</span>
          </Link>
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

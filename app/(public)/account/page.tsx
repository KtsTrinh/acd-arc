"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { formatVND, formatDateTime } from "@/lib/utils";
import {
  User,
  ShoppingBag,
  Download,
  Clock,
  ShieldCheck,
  ExternalLink,
  Layers,
  LayoutDashboard,
  LogOut,
} from "lucide-react";

export default function AccountPage() {
  const [user, setUser] = useState<any>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/auth/me").then((r) => r.json()),
      fetch("/api/orders").then((r) => r.json()),
    ])
      .then(([userData, orderData]) => {
        if (userData.user) setUser(userData.user);
        if (orderData.orders) setOrders(orderData.orders);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const handleLogout = async () => {
    await fetch("/api/auth/me", { method: "POST" });
    window.location.href = "/";
  };

  if (loading) {
    return (
      <div className="pt-36 pb-20 text-center text-slate-400">
        Đang tải thông tin tài khoản...
      </div>
    );
  }

  if (!user) {
    return (
      <div className="pt-36 pb-24 max-w-md mx-auto px-4 text-center space-y-4">
        <div className="w-16 h-16 mx-auto rounded-full bg-thuy-800 flex items-center justify-center text-thuy-400">
          <User className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-white">Bạn chưa đăng nhập</h2>
        <p className="text-xs text-slate-400">
          Vui lòng đăng nhập để xem lịch sử đơn hàng và các liên kết tải tài nguyên kỹ thuật số.
        </p>
        <Link
          href="/login"
          className="inline-block px-6 py-3 rounded-xl bg-thuy-400 text-thuy-950 font-bold text-xs uppercase tracking-wider hover:brightness-110 shadow-glow-cyan"
        >
          Đăng nhập ngay
        </Link>
      </div>
    );
  }

  // Flatten active downloads from paid orders
  const activeDownloads = orders
    .filter((o) => o.status === "PAID")
    .flatMap((o) => o.downloads || []);

  return (
    <div className="pt-28 pb-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
      {/* Profile Header */}
      <div className="p-6 sm:p-8 rounded-3xl bg-thuy-850 border border-thuy-750 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-thuy-400 to-thuy-600 flex items-center justify-center font-bold text-thuy-950 text-2xl shadow-glow-cyan">
            {user.name ? user.name[0].toUpperCase() : "U"}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-display font-bold text-xl sm:text-2xl text-white">
                {user.name || "Khách Hàng ACD"}
              </h1>
              <span className="px-2.5 py-0.5 rounded-full bg-thuy-750 text-thuy-300 text-[10px] font-bold border border-thuy-600">
                {user.role}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">{user.email}</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {user.role === "ADMIN" && (
            <Link
              href="/admin"
              className="px-4 py-2 rounded-xl bg-thuy-400 text-thuy-950 font-bold text-xs hover:brightness-110 transition-all flex items-center gap-1.5 shadow-glow-cyan"
            >
              <LayoutDashboard className="w-3.5 h-3.5" />
              <span>Vào Quản Trị CMS</span>
            </Link>
          )}

          <Link
            href="/account/security"
            className="px-4 py-2 rounded-xl bg-thuy-800 hover:bg-thuy-750 text-thuy-300 text-xs font-semibold border border-thuy-700 transition-colors flex items-center gap-1.5"
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Bảo Mật</span>
          </Link>

          <button
            onClick={handleLogout}
            className="px-4 py-2 rounded-xl bg-thuy-800 hover:bg-thuy-750 text-red-400 text-xs font-semibold border border-thuy-700 transition-colors flex items-center gap-1.5"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Đăng xuất</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Purchased Assets & Order History */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 items-start">
        {/* Left 2 Cols: Digital Assets Download Center */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between border-b border-thuy-800 pb-3">
            <h2 className="font-display font-bold text-xl text-white flex items-center gap-2">
              <Download className="w-5 h-5 text-thuy-400" />
              <span>Tài Nguyên Kỹ Thuật Số Đã Mua ({activeDownloads.length})</span>
            </h2>
            <span className="text-xs text-slate-400">Bảo mật & Giới hạn tải</span>
          </div>

          {activeDownloads.length === 0 ? (
            <div className="text-center py-12 rounded-2xl bg-thuy-850/50 border border-thuy-800 space-y-3">
              <p className="text-xs text-slate-400">
                Bạn chưa có liên kết tải nào đang hoạt động.
              </p>
              <Link
                href="/products"
                className="inline-block px-4 py-2 rounded-lg bg-thuy-400 text-thuy-950 font-semibold text-xs"
              >
                Khám phá kho CAD & 3D
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {activeDownloads.map((dl: any, index: number) => {
                const downloadUrl = `/api/downloads/${dl.token}`;
                const remainingHours = Math.max(
                  0,
                  Math.round(
                    (new Date(dl.expiresAt).getTime() - new Date().getTime()) / (1000 * 60 * 60)
                  )
                );

                return (
                  <div
                    key={dl.id || index}
                    className="p-5 rounded-2xl bg-thuy-850 border border-thuy-750 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-thuy-400 transition-colors"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-xs">
                        <span className="px-2 py-0.5 rounded bg-thuy-800 text-thuy-300 font-bold text-[10px] border border-thuy-700">
                          FILE #{index + 1}
                        </span>
                        <span className="text-emerald-400 font-medium">
                          Hiệu lực còn: {remainingHours} giờ
                        </span>
                      </div>
                      <h3 className="font-semibold text-sm text-white">
                        Hồ sơ thiết kế kỹ thuật số ACD
                      </h3>
                      <p className="text-xs text-slate-400">
                        Số lần đã tải: <b>{dl.downloadCount}</b> / {dl.maxDownloads} lần
                      </p>
                    </div>

                    <a
                      href={downloadUrl}
                      download
                      className="py-2.5 px-5 rounded-xl font-bold text-xs uppercase tracking-wider text-thuy-950 bg-gradient-to-r from-thuy-400 to-aqua-400 hover:brightness-110 shadow-glow-cyan transition-all flex items-center justify-center gap-2"
                    >
                      <Download className="w-4 h-4" />
                      <span>Tải Ngay</span>
                    </a>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Col: Orders History */}
        <div className="p-6 rounded-2xl bg-thuy-850 border border-thuy-750 space-y-4">
          <h3 className="font-display font-bold text-lg text-white border-b border-thuy-750 pb-3">
            Lịch Sử Đơn Hàng
          </h3>

          {orders.length === 0 ? (
            <p className="text-xs text-slate-400 text-center py-6">Chưa có đơn hàng nào.</p>
          ) : (
            <div className="space-y-3">
              {orders.map((o) => (
                <Link
                  key={o.id}
                  href={`/orders/${o.id}`}
                  className="block p-3.5 rounded-xl bg-thuy-900 border border-thuy-800 hover:border-thuy-600 transition-colors"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="font-bold text-xs text-white block">
                        #{o.orderNumber}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        {formatDateTime(o.createdAt)}
                      </span>
                    </div>

                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        o.status === "PAID"
                          ? "bg-emerald-500/20 text-emerald-400"
                          : "bg-amber-500/20 text-amber-400"
                      }`}
                    >
                      {o.status}
                    </span>
                  </div>

                  <div className="mt-2 pt-2 border-t border-thuy-800 flex justify-between text-xs">
                    <span className="text-slate-400">Tổng tiền:</span>
                    <span className="font-bold text-thuy-400">{formatVND(o.total)}</span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}


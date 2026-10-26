"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  BookOpen,
  Tags,
  Image as ImageIcon,
  Users,
  Activity,
  Settings,
  GitBranch,
  ExternalLink,
  LogOut,
  ChevronRight,
} from "lucide-react";

export default function AdminSidebar() {
  const pathname = usePathname();

  const menuItems = [
    { label: "Dashboard Tổng Quan", href: "/admin", icon: LayoutDashboard },
    { label: "Danh Mục Sản Phẩm", href: "/admin/catalog", icon: Package },
    { label: "Đơn Hàng & Cấp Tải", href: "/admin/orders", icon: ShoppingBag },
    { label: "Khách Hàng & Truy Cập", href: "/admin/customers", icon: Activity },
    { label: "Tạp Chí & Bài Viết", href: "/admin/blog", icon: BookOpen },
    { label: "Thẻ Tags", href: "/admin/tags", icon: Tags },
    { label: "Media Library Dùng Chung", href: "/admin/media", icon: ImageIcon },
    { label: "Người Dùng & Phân Quyền", href: "/admin/users", icon: Users },
    { label: "Cấu Hình Hệ Thống", href: "/admin/settings", icon: Settings },
    { label: "Đồng Bộ Mã Nguồn", href: "/admin/sync", icon: GitBranch },
  ];

  const handleLogout = async () => {
    await fetch("/api/auth/me", { method: "POST" });
    window.location.href = "/";
  };

  return (
    <aside className="w-64 bg-white/70 backdrop-blur-xl border-r border-slate-200/60 flex flex-col h-screen sticky top-0 shadow-[inset_-1px_0_0_rgba(255,255,255,0.6)]">
      {/* Brand Header */}
      <div className="p-5 border-b border-slate-200/60 flex items-center justify-between">
        <Link href="/admin" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center font-display font-extrabold text-white text-sm shadow-lg shadow-cyan-500/30">
            ACD
          </div>
          <div>
            <span className="font-display font-bold text-sm tracking-wide text-slate-900 block">
              ACD ADMIN CMS
            </span>
            <span className="text-[10px] text-cyan-600 font-medium">Hệ Thống Đồng Toàn Diện</span>
          </div>
        </Link>
      </div>

      {/* Nav Menu */}
      <nav className="flex-1 overflow-y-auto p-3.5 space-y-1">
        {menuItems.map((item) => {
          const isActive =
            item.href === "/admin"
              ? pathname === "/admin"
              : pathname.startsWith(item.href) ||
                (item.href === "/admin/catalog" && pathname.startsWith("/admin/projects"));
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`group flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-all duration-200 relative ${
                isActive
                  ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold shadow-lg shadow-cyan-500/25"
                  : "text-slate-600 hover:text-slate-900 hover:bg-cyan-50"
              }`}
            >
              {isActive && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 rounded-r-full bg-white/80" />
              )}
              <div className="flex items-center gap-3">
                <Icon className={`w-4 h-4 ${isActive ? "text-white" : "text-cyan-600 group-hover:scale-110 transition-transform"}`} />
                <span>{item.label}</span>
              </div>
              {isActive && <ChevronRight className="w-3.5 h-3.5" />}
            </Link>
          );
        })}
      </nav>

      {/* Footer link to public website & logout */}
      <div className="p-3.5 border-t border-slate-200/60 space-y-2 bg-slate-50/60">
        <Link
          href="/"
          target="_blank"
          className="flex items-center justify-between px-3 py-2 rounded-lg text-xs text-slate-600 hover:text-cyan-700 hover:bg-cyan-50 transition-colors"
        >
          <div className="flex items-center gap-2">
            <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
            <span>Xem Website Khách Hàng</span>
          </div>
        </Link>

        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-red-500 hover:bg-red-50 hover:text-red-600 transition-colors"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Đăng xuất Admin</span>
        </button>
      </div>
    </aside>
  );
}


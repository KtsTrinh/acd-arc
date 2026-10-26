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
    <aside className="w-64 bg-navy-900 border-r border-navy-800 flex flex-col h-screen sticky top-0">
      {/* Brand Header */}
      <div className="p-5 border-b border-navy-800/80 flex items-center justify-between">
        <Link href="/admin" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-navy-800 flex items-center justify-center font-display font-extrabold text-white text-sm shadow-sm">
            ACD
          </div>
          <div>
            <span className="font-display font-bold text-sm tracking-wide text-white block">
              ACD ADMIN CMS
            </span>
            <span className="text-[10px] text-silver-400 font-medium">Hệ Thống Đồng Toàn Diện</span>
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
              className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-all ${
                isActive
                  ? "bg-blue-600 text-white font-bold shadow-sm"
                  : "text-silver-400 hover:text-white hover:bg-navy-800"
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-4 h-4 ${isActive ? "text-white" : "text-silver-400"}`} />
                <span>{item.label}</span>
              </div>
              {isActive && <ChevronRight className="w-3.5 h-3.5" />}
            </Link>
          );
        })}
      </nav>

      {/* Footer link to public website & logout */}
      <div className="p-3.5 border-t border-navy-800/80 space-y-2 bg-navy-950/40">
        <Link
          href="/"
          target="_blank"
          className="flex items-center justify-between px-3 py-2 rounded-lg text-xs text-slate-300 hover:text-thuy-300 hover:bg-thuy-850 transition-colors"
        >
          <div className="flex items-center gap-2">
            <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
            <span>Xem Website Khách Hàng</span>
          </div>
        </Link>

        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Đăng xuất Admin</span>
        </button>
      </div>
    </aside>
  );
}


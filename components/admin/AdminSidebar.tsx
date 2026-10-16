"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Building2,
  FolderTree,
  Package,
  ShoppingBag,
  BookOpen,
  Tags,
  Image as ImageIcon,
  Users,
  ExternalLink,
  LogOut,
  ChevronRight,
} from "lucide-react";

export default function AdminSidebar() {
  const pathname = usePathname();

  const menuItems = [
    { label: "Dashboard Tổng Quan", href: "/admin", icon: LayoutDashboard },
    { label: "Dự Án Kiến Trúc", href: "/admin/projects", icon: Building2 },
    { label: "Danh Mục Dự Án", href: "/admin/categories", icon: FolderTree },
    { label: "Sản Phẩm & File 3D/CAD", href: "/admin/products", icon: Package },
    { label: "Đơn Hàng & Cấp Tải", href: "/admin/orders", icon: ShoppingBag },
    { label: "Tạp Chí & Bài Viết", href: "/admin/blog", icon: BookOpen },
    { label: "Thẻ Tags", href: "/admin/tags", icon: Tags },
    { label: "Media Library Dùng Chung", href: "/admin/media", icon: ImageIcon },
    { label: "Người Dùng & Phân Quyền", href: "/admin/users", icon: Users },
  ];

  const handleLogout = async () => {
    await fetch("/api/auth/me", { method: "POST" });
    window.location.href = "/";
  };

  return (
    <aside className="w-64 bg-thuy-950 border-r border-thuy-750 flex flex-col h-screen sticky top-0">
      {/* Brand Header */}
      <div className="p-5 border-b border-thuy-750/80 flex items-center justify-between">
        <Link href="/admin" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-thuy-400 to-thuy-600 flex items-center justify-center font-display font-extrabold text-thuy-950 text-sm shadow-glow-cyan">
            ACD
          </div>
          <div>
            <span className="font-display font-bold text-sm tracking-wide text-white block">
              ACD ADMIN CMS
            </span>
            <span className="text-[10px] text-thuy-400 font-medium">Hệ Thống Động Toàn Diện</span>
          </div>
        </Link>
      </div>

      {/* Nav Menu */}
      <nav className="flex-1 overflow-y-auto p-3.5 space-y-1">
        {menuItems.map((item) => {
          const isActive =
            item.href === "/admin"
              ? pathname === "/admin"
              : pathname.startsWith(item.href);
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-all ${
                isActive
                  ? "bg-thuy-400 text-thuy-950 font-bold shadow-glow-cyan"
                  : "text-slate-300 hover:text-white hover:bg-thuy-850"
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-4 h-4 ${isActive ? "text-thuy-950" : "text-thuy-400"}`} />
                <span>{item.label}</span>
              </div>
              {isActive && <ChevronRight className="w-3.5 h-3.5" />}
            </Link>
          );
        })}
      </nav>

      {/* Footer link to public website & logout */}
      <div className="p-3.5 border-t border-thuy-750/80 space-y-2 bg-thuy-900/40">
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


"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "../../hooks/useAuth";
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  Tags,
  Image as ImageIcon,
  Users,
  Activity,
  Settings,
  GitBranch,
  ExternalLink,
  LogOut,
  CreditCard,
  Menu,
  X,
} from "lucide-react";

export default function AdminSidebar() {
  const pathname = usePathname();
  const { user } = useAuth();
  const [open, setOpen] = useState(false);

  const menuItems = useMemo(() => {
    const rawItems = [
      { label: "Dashboard Tổng Quan", href: "/admin", icon: LayoutDashboard, group: "Tổng quan" },
      { label: "Danh Mục Sản Phẩm", href: "/admin/catalog", icon: Package, group: "Nghiệp vụ" },
      { label: "Đơn Hàng & Cấp Tải", href: "/admin/orders", icon: ShoppingBag, group: "Nghiệp vụ" },
      { label: "Khách Hàng & Truy Cập", href: "/admin/customers", icon: Activity, group: "Nghiệp vụ" },
      { label: "Thẻ Tags", href: "/admin/tags", icon: Tags, group: "Nội dung" },
      { label: "Media Library", href: "/admin/media", icon: ImageIcon, group: "Nội dung" },
      { label: "Người Dùng & Phân Quyền", href: "/admin/users", icon: Users, group: "Hệ thống" },
      { label: "Cấu Hình Hệ Thống", href: "/admin/settings", icon: Settings, group: "Hệ thống" },
      user?.role === "SUPER_ADMIN"
        ? { label: "Cấu hình tài khoản thanh toán", href: "/admin/payment-settings", icon: CreditCard, group: "Hệ thống" }
        : null,
      { label: "Đồng Bộ Mã Nguồn", href: "/admin/sync", icon: GitBranch, group: "Hệ thống" },
    ];
    return rawItems.filter((item): item is Exclude<typeof item, null> => item !== null);
  }, [user]);

  const handleLogout = async () => {
    try { await fetch("/api/auth/me", { method: "POST" }); } catch (e) {}
    window.location.href = "/";
  };

  const grouped = {} as Record<string, any[]>;
  menuItems.forEach((item) => {
    const group = (item as any).group || "Khác";
    if (!grouped[group]) grouped[group] = [];
    grouped[group].push(item);
  });
  const groupOrder = ["Tổng quan", "Nghiệp vụ", "Nội dung", "Hệ thống", "Khác"];

  const NavContent = (
    <>
      <div className="p-5 border-b border-white/5">
        <Link href="/admin" className="flex items-center gap-3" onClick={() => setOpen(false)}>
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-[#22C7E8] to-[#087EA4] flex items-center justify-center font-display font-extrabold text-white text-sm shadow-[0_4px_16px_rgba(34,199,232,0.25)]">
            ACD
          </div>
          <div className="flex flex-col text-center">
            <span className="font-display font-bold text-sm tracking-wide text-white block leading-tight">ADMIN CMS</span>
            <span className="text-[10px] text-[#22C7E8] font-medium tracking-wide">HỆ THỐNG QUẢN LÝ CMS ĐỘNG</span>
          </div>
        </Link>
      </div>
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
        {groupOrder.map((group) => {
          const items = grouped[group];
          if (!items || items.length === 0) return null;
          return (
            <div key={group} className="space-y-1.5">
              <div className="px-3 text-[10px] uppercase tracking-[0.18em] text-white/40 font-semibold">{group}</div>
              {items.map((item) => {
                const isActive = item.href === "/admin" ? pathname === "/admin" : pathname.startsWith(item.href);
                const Icon = item.icon;
                return (
                  <Link key={item.href} href={item.href} onClick={() => setOpen(false)}
                    className={"group relative flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium transition-all duration-150 " + (isActive ? "text-white" : "text-white/70 hover:text-white hover:bg-[#11243D]")}
                    style={isActive ? { backgroundColor: "#143451" } : undefined}>
                    {isActive && <span className="absolute left-0 top-1/2 -translate-y-1/2 h-6 w-1 rounded-r bg-[#22C7E8]" />}
                    <Icon className={"w-4 h-4 " + (isActive ? "text-[#22C7E8] ml-2" : "text-white/60 group-hover:text-white") + " transition-colors"} />
                    <span className={isActive ? "ml-2" : ""}>{item.label}</span>
                  </Link>
                );
              })}
            </div>
          );
        })}
      </nav>
      <div className="p-3 border-t border-white/5 bg-[#06111F] space-y-1.5">
        <Link href="/" target="_blank" className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-white/70 hover:text-white hover:bg-[#11243D] transition-colors">
          <ExternalLink className="w-3.5 h-3.5" /><span>Xem Website Khách Hàng</span>
        </Link>
        <button onClick={handleLogout} className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-red-300 hover:bg-red-500/10 hover:text-red-200 transition-colors">
          <LogOut className="w-3.5 h-3.5" /><span>Đăng xuất Admin</span>
        </button>
      </div>
    </>
  );

  return (
    <>
      <button onClick={() => setOpen(true)} className="lg:hidden fixed top-3 left-3 z-50 p-2 rounded-lg bg-[#081426] text-white shadow-lg" aria-label="Open menu">
        <Menu className="w-5 h-5" />
      </button>
      <aside className="hidden lg:flex w-64 flex-col h-screen sticky top-0 z-40 border-r border-white/5 bg-[#081426]">{NavContent}</aside>
      {open && (
        <div className="lg:hidden fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/50" onClick={() => setOpen(false)} />
          <aside className="absolute left-0 top-0 h-full w-72 max-w-[85vw] flex flex-col bg-[#081426] shadow-2xl">
            {NavContent}
            <button onClick={() => setOpen(false)} className="absolute top-3 right-3 p-2 text-white/70 hover:text-white" aria-label="Close menu"><X className="w-5 h-5" /></button>
          </aside>
        </div>
      )}
    </>
  );
}
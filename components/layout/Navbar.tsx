"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCartStore } from "@/lib/cart";
import CartDrawer from "../cart/CartDrawer";
import {
  Compass,
  ShoppingBag,
  User,
  Menu,
  X,
  Search,
  LayoutDashboard,
  LogOut,
  Layers,
  ChevronDown,
} from "lucide-react";

export default function Navbar() {
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [userDropdown, setUserDropdown] = useState(false);
  const totalItems = useCartStore((state) => state.totalItems());

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 30);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Fetch current user
  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => {
        if (data.user) setUser(data.user);
      })
      .catch(() => {});
  }, [pathname]);

  const handleLogout = async () => {
    await fetch("/api/auth/me", { method: "POST" });
    setUser(null);
    setUserDropdown(false);
    window.location.href = "/";
  };

  const navLinks = [
    { label: "Trang Chủ", href: "/" },
    { label: "Dự Án Kiến Trúc", href: "/projects" },
    { label: "Tài Nguyên CAD & 3D", href: "/products" },
    { label: "Tạp Chí & Phong Thủy", href: "/blog" },
  ];

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
          isScrolled
            ? "bg-thuy-950/90 backdrop-blur-md border-b border-thuy-700/60 py-3 shadow-lg"
            : "bg-gradient-to-b from-thuy-950/80 to-transparent py-5"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          {/* Brand Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-thuy-400 via-thuy-600 to-thuy-900 p-0.5 shadow-glow-cyan flex items-center justify-center">
              <div className="w-full h-full bg-thuy-950 rounded-[10px] flex items-center justify-center group-hover:bg-transparent transition-colors">
                <span className="font-display font-extrabold text-white text-lg tracking-wider">
                  ACD
                </span>
              </div>
            </div>
            <div className="flex flex-col">
              <span className="font-display font-bold text-lg tracking-wider text-white flex items-center gap-1.5">
                ACD <span className="text-thuy-400 text-xs font-light">STUDIO</span>
              </span>
              <span className="text-[10px] text-slate-400 uppercase tracking-widest -mt-1">
                Architecture & Interior
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1 bg-thuy-850/60 px-4 py-1.5 rounded-full border border-thuy-700/50 backdrop-blur-sm">
            {navLinks.map((link) => {
              const isActive = pathname === link.href || (link.href !== "/" && pathname.startsWith(link.href));
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-4 py-2 rounded-full text-xs uppercase tracking-wider font-medium transition-all ${
                    isActive
                      ? "text-thuy-950 bg-thuy-400 font-semibold shadow-glow-cyan"
                      : "text-slate-300 hover:text-white hover:bg-thuy-750/50"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Right Action Icons */}
          <div className="flex items-center gap-3">
            {/* Search Link */}
            <Link
              href="/projects"
              className="p-2.5 rounded-full bg-thuy-850/80 hover:bg-thuy-700/80 text-slate-300 hover:text-thuy-300 border border-thuy-700/60 transition-colors"
              title="Tìm kiếm dự án"
            >
              <Search className="w-4 h-4" />
            </Link>

            {/* Cart Button */}
            <button
              onClick={() => setCartOpen(true)}
              className="relative p-2.5 rounded-full bg-thuy-850/80 hover:bg-thuy-700/80 text-slate-300 hover:text-thuy-300 border border-thuy-700/60 transition-colors"
              title="Giỏ tài nguyên"
            >
              <ShoppingBag className="w-4 h-4" />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-thuy-400 text-thuy-950 font-bold text-[10px] flex items-center justify-center shadow-glow-cyan animate-pulse">
                  {totalItems}
                </span>
              )}
            </button>

            {/* User Profile or Login */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setUserDropdown(!userDropdown)}
                  className="flex items-center gap-2 py-1 px-2.5 rounded-full bg-thuy-850 border border-thuy-700 hover:border-thuy-500 transition-colors"
                >
                  <div className="w-7 h-7 rounded-full bg-thuy-600 flex items-center justify-center text-xs font-semibold text-white">
                    {user.name ? user.name[0].toUpperCase() : "U"}
                  </div>
                  <span className="hidden sm:inline text-xs text-slate-200 font-medium max-w-[100px] truncate">
                    {user.name || user.email}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </button>

                {/* Dropdown Menu */}
                {userDropdown && (
                  <div className="absolute right-0 mt-2 w-52 rounded-xl bg-thuy-900 border border-thuy-700 shadow-2xl py-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                    <div className="px-4 py-2 border-b border-thuy-700/60 text-xs">
                      <p className="text-white font-medium truncate">{user.name}</p>
                      <p className="text-slate-400 truncate">{user.email}</p>
                      {user.role === "ADMIN" && (
                        <span className="inline-block mt-1 px-2 py-0.5 rounded bg-thuy-500/20 text-thuy-300 font-bold text-[10px] border border-thuy-500/30">
                          Hệ thống Quản Trị
                        </span>
                      )}
                    </div>

                    {user.role === "ADMIN" && (
                      <Link
                        href="/admin"
                        onClick={() => setUserDropdown(false)}
                        className="flex items-center gap-2 px-4 py-2.5 text-xs text-thuy-400 hover:bg-thuy-800 transition-colors font-semibold"
                      >
                        <LayoutDashboard className="w-4 h-4" />
                        <span>Trang Quản Trị CMS</span>
                      </Link>
                    )}

                    <Link
                      href="/account"
                      onClick={() => setUserDropdown(false)}
                      className="flex items-center gap-2 px-4 py-2 text-xs text-slate-300 hover:bg-thuy-800 hover:text-white transition-colors"
                    >
                      <Layers className="w-4 h-4" />
                      <span>Đơn hàng & Tải file</span>
                    </Link>

                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2 px-4 py-2 text-xs text-red-400 hover:bg-thuy-800 transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Đăng xuất</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                href="/login"
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold text-slate-200 bg-thuy-850 hover:bg-thuy-800 border border-thuy-700/80 transition-all hover:border-thuy-500"
              >
                <User className="w-3.5 h-3.5" />
                <span>Đăng nhập</span>
              </Link>
            )}

            {/* Mobile menu toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2.5 rounded-xl bg-thuy-850 text-slate-300 border border-thuy-700"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden px-4 pt-3 pb-6 bg-thuy-950 border-b border-thuy-700 space-y-2 animate-in slide-in-from-top-4">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`block px-4 py-2.5 rounded-lg text-sm font-medium ${
                  pathname === link.href
                    ? "bg-thuy-400 text-thuy-950 font-bold"
                    : "text-slate-300 hover:bg-thuy-850"
                }`}
              >
                {link.label}
              </Link>
            ))}
            {user?.role === "ADMIN" && (
              <Link
                href="/admin"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-4 py-2.5 rounded-lg text-sm font-bold text-thuy-400 bg-thuy-900 border border-thuy-700"
              >
                Quản trị CMS
              </Link>
            )}
          </div>
        )}
      </header>

      {/* Cart Drawer */}
      <CartDrawer isOpen={cartOpen} onClose={() => setCartOpen(false)} />
    </>
  );
}


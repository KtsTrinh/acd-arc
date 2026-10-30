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

interface NavLink {
  label: string;
  href?: string;
  children?: NavLink[];
}

export default function Navbar() {
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [userDropdown, setUserDropdown] = useState(false);
  const [openDesktopSub, setOpenDesktopSub] = useState<Set<string>>(
    new Set(),
  );
  const [openMobileSub, setOpenMobileSub] = useState<Set<string>>(
    new Set(),
  );
  const totalItems = useCartStore((state) => state.totalItems());

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 30);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

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
    useCartStore.getState().clearCart();
    setUser(null);
    setUserDropdown(false);
    window.location.href = "/";
  };

  const handleCartOpen = () => {
    if (!user) {
      window.location.href = "/login?from=%2Fcart";
      return;
    }
    setCartOpen(true);
  };

  const isActiveLink = (href?: string) => {
    if (!href) return false;
    if (href === "/") return pathname === "/";
    return pathname === href || pathname.startsWith(href);
  };

  const toggleDesktopSub = (key: string) => {
    setOpenDesktopSub((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const toggleMobileSub = (key: string) => {
    setOpenMobileSub((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const navLinks: NavLink[] = [
    { label: "Trang Chủ", href: "/" },
    {
      label: "Dự Án Kiến Trúc",
      href: "/projects",
      children: [
        { label: "Tất Cả", href: "/projects" },
        { label: "Biệt Thự", href: "/projects?category=biet-thu" },
        { label: "Nhà Phố", href: "/projects?category=nha-pho" },
        { label: "Penthouse", href: "/projects?category=penthouse" },
        { label: "Nội Thất", href: "/projects?category=noi-that" },
      ],
    },
    {
      label: "Tài Nguyên CAD & 3D",
      href: "/products",
      children: [
        { label: "Tất Cả", href: "/products" },
        { label: "CAD", href: "/products?type=ARCHITECTURE" },
        { label: "Mô Hình 3D", href: "/products?type=INTERIOR" },
        { label: "File Kỹ Thuật", href: "/products?type=CONSTRUCTION" },
        { label: "Template", href: "/products?type=DIGITAL_FILE" },
      ],
    },
    {
      label: "Tạp Chí & Phong Thủy",
      href: "/blog",
      children: [
        { label: "Tất Cả", href: "/blog" },
        { label: "Phong Thủy", href: "/blog?category=phong-thuy" },
        { label: "Kiến Trúc", href: "/blog?category=kien-truc" },
      ],
    },
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

          <nav className="hidden md:flex items-center gap-1 bg-thuy-850/60 px-4 py-1.5 rounded-full border border-thuy-700/50 backdrop-blur-sm">
            {navLinks.map((link) => {
              const active = isActiveLink(link.href);
              const hasChildren = link.children && link.children.length > 0;
              const subOpen = openDesktopSub.has(link.label);
              return (
                <div key={link.href || link.label} className="relative group">
                  <Link
                    href={link.href || "#"}
                    onClick={(e) => {
                      if (hasChildren) e.preventDefault();
                      toggleDesktopSub(link.label);
                    }}
                    className={
                      active
                        ? "px-4 py-2 rounded-full text-xs uppercase tracking-wider font-medium text-thuy-950 bg-thuy-400 font-semibold shadow-glow-cyan transition-all"
                        : "px-4 py-2 rounded-full text-xs uppercase tracking-wider font-medium text-slate-300 hover:text-white hover:bg-thuy-750/50 transition-all"
                    }
                  >
                    {link.label}
                    {hasChildren && (
                      <ChevronDown
                        className={
                          subOpen
                            ? "w-3 h-3 ml-1 text-slate-400 transition-transform duration-200 rotate-180"
                            : "w-3 h-3 ml-1 text-slate-400 transition-transform duration-200"
                        }
                      />
                    )}
                  </Link>
                  {hasChildren && subOpen && (
                    <div className="absolute left-1/2 -translate-x-1/2 mt-2 w-60 rounded-xl bg-thuy-900 border border-thuy-700 shadow-2xl py-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                      {link.children!.map((child) => {
                        const childActive = isActiveLink(child.href);
                        return (
                          <Link
                            key={child.href || child.label}
                            href={child.href || "#"}
                            className={
                              childActive
                                ? "block px-4 py-2 text-xs text-thuy-950 bg-thuy-400 font-semibold transition-colors"
                                : "block px-4 py-2 text-xs text-slate-300 hover:bg-thuy-800 hover:text-white transition-colors"
                            }
                          >
                            {child.label}
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </nav>

          <div className="flex items-center gap-3">
            <Link
              href="/projects"
              className="p-2.5 rounded-full bg-thuy-850/80 hover:bg-thuy-700/80 text-slate-300 hover:text-thuy-300 border border-thuy-700/60 transition-colors"
              title="Tìm kiếm dự án"
            >
              <Search className="w-4 h-4" />
            </Link>

            <button
              onClick={handleCartOpen}
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

                {userDropdown && (
                  <div className="absolute right-0 mt-2 w-52 rounded-xl bg-thuy-900 border border-thuy-700 shadow-2xl py-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                    <div className="px-4 py-2 border-b border-thuy-700/60 text-xs">
                      <p className="text-white font-medium truncate">{user.name}</p>
                      <p className="text-slate-400 truncate">{user.email}</p>
                      {(user.role === "ADMIN" || user.role === "SUPER_ADMIN") && (
                        <span className="inline-block mt-1 px-2 py-0.5 rounded bg-thuy-500/20 text-thuy-300 font-bold text-[10px] border border-thuy-500/30">
                          Hệ thống Quản Trị
                        </span>
                      )}
                    </div>

                    {(user.role === "ADMIN" || user.role === "SUPER_ADMIN") && (
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

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2.5 rounded-xl bg-thuy-850 text-slate-300 border border-thuy-700"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden px-4 pt-3 pb-6 bg-thuy-950 border-b border-thuy-700 animate-in slide-in-from-top-4">
            {navLinks.map((link) => {
              const hasChildren = link.children && link.children.length > 0;
              const subOpen = openMobileSub.has(link.label);
              return (
                <div key={link.href || link.label} className="mb-1">
                  <button
                    onClick={() => {
                      if (hasChildren) {
                        toggleMobileSub(link.label);
                      } else {
                        setMobileMenuOpen(false);
                      }
                    }}
                    className={
                      isActiveLink(link.href)
                        ? "flex items-center justify-between w-full px-4 py-2.5 rounded-lg text-sm font-medium bg-thuy-400 text-thuy-950 font-bold transition-colors"
                        : "flex items-center justify-between w-full px-4 py-2.5 rounded-lg text-sm font-medium text-slate-300 hover:bg-thuy-850 transition-colors"
                    }
                  >
                    <span>{link.label}</span>
                    {hasChildren && (
                      <ChevronDown
                        className={
                          subOpen
                            ? "w-4 h-4 text-slate-500 transition-transform duration-200 rotate-180"
                            : "w-4 h-4 text-slate-500 transition-transform duration-200"
                        }
                      />
                    )}
                  </button>
                  {hasChildren && subOpen && (
                    <div className="pl-4 pt-1 space-y-1">
                      {link.children!.map((child) => {
                        const childActive = isActiveLink(child.href);
                        return (
                          <Link
                            key={child.href || child.label}
                            href={child.href || "#"}
                            onClick={() => setMobileMenuOpen(false)}
                            className={
                              childActive
                                ? "block px-4 py-2 rounded-lg text-xs text-thuy-950 bg-thuy-400 font-semibold transition-colors"
                                : "block px-4 py-2 rounded-lg text-xs text-slate-400 hover:bg-thuy-800 hover:text-white transition-colors"
                            }
                          >
                            {child.label}
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
            {user?.role === "ADMIN" && (
              <Link
                href="/admin"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-4 py-2.5 rounded-lg text-sm font-bold text-thuy-400 bg-thuy-900 border border-thuy-700 mt-2"
              >
                Quản trị CMS
              </Link>
            )}
          </div>
        )}
      </header>

      <CartDrawer isOpen={cartOpen} onClose={() => setCartOpen(false)} />
    </>
  );
}

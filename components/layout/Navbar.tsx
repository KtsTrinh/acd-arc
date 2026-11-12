"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useCartStore } from "@/lib/cart";
import CartDrawer from "../cart/CartDrawer";
import {
  ShoppingBag,
  User,
  Menu,
  X,
  Search,
  LayoutDashboard,
  LogOut,
  Layers,
  ChevronDown,
  ChevronRight,
} from "lucide-react";

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [userDropdown, setUserDropdown] = useState(false);
  const [groupCategories, setGroupCategories] = useState<Record<string, string[]>>(
    {},
  );
  const [groupsLoaded, setGroupsLoaded] = useState(false);
  const [openDesktopSub, setOpenDesktopSub] = useState<Set<string>>(
    new Set(),
  );
  const [openMobileSub, setOpenMobileSub] = useState<Set<string>>(
    new Set(),
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const totalItems = useCartStore((state) => state.totalItems());

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 30);
    };
    window.addEventListener("scroll", handleScroll);

    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest("nav")) {
        setOpenDesktopSub(new Set());
      }
    };
    window.addEventListener("click", handleClickOutside);
    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("click", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => {
        if (data.user) setUser(data.user);
      })
      .catch(() => {});
  }, [pathname]);

  useEffect(() => {
    const loadData = async () => {
      try {
        const groupsRes = await fetch("/api/products/groups");
        const groupsData = await groupsRes.json();
        const groups: string[] = groupsData.groups || [];

        const catMap: Record<string, string[]> = {};
        for (const group of groups) {
          const catsRes = await fetch(
            `/api/products/categories?group=${encodeURIComponent(group)}`,
          );
          const catsData = await catsRes.json();
          catMap[group] = catsData.categories || [];
        }
        setGroupCategories(catMap);
      } catch (e) {
        console.error("Error loading menu data:", e);
      } finally {
        setGroupsLoaded(true);
      }
    };
    loadData();
  }, []);

  const groups = Object.keys(groupCategories);

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

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const q = searchQuery.trim();
    if (q) {
      router.push(`/products?search=${encodeURIComponent(q)}`);
      setSearchOpen(false);
      setSearchQuery("");
    }
  };

  const isActiveLink = (href?: string) => {
    if (!href) return false;
    if (href === "/") return pathname === "/";
    return pathname === href || pathname.startsWith(href);
  };

  const isActiveGroup = (group: string) => {
    return pathname.includes(`productGroup=${encodeURIComponent(group)}`);
  };

  const toggleMobileSub = (key: string) => {
    setOpenMobileSub((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const isMobileGroupOpen = (group: string) =>
    openMobileSub.has(group);

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
            <Link
              href="/"
              className={
                pathname === "/"
                  ? "px-4 py-2 rounded-full text-xs uppercase tracking-wider font-medium text-thuy-950 bg-thuy-400 font-semibold shadow-glow-cyan transition-all"
                  : "px-4 py-2 rounded-full text-xs uppercase tracking-wider font-medium text-slate-300 hover:text-white hover:bg-thuy-750/50 transition-all"
              }
            >
              Trang Chủ
            </Link>
            {groupsLoaded &&
              groups.map((group) => {
                const isOpen = openDesktopSub.has(group);
                return (
                  <div key={group} className="relative group">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setOpenDesktopSub(new Set());
                        router.push(`/products?productGroup=${encodeURIComponent(group)}`);
                      }}
                      className={
                        isActiveGroup(group)
                          ? "flex items-center gap-2 px-4 py-2 rounded-full text-xs uppercase tracking-wider font-medium text-thuy-950 bg-thuy-400 font-semibold shadow-glow-cyan transition-all"
                          : "flex items-center gap-2 px-4 py-2 rounded-full text-xs uppercase tracking-wider font-medium text-slate-300 hover:text-white hover:bg-thuy-750/50 transition-all"
                      }
                    >
                      {group}
                    </button>
                    {groupCategories[group] && groupCategories[group].length > 0 && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setOpenDesktopSub((prev) => {
                            const next = new Set(prev);
                            if (next.has(group)) {
                              next.delete(group);
                            } else {
                              next.clear();
                              next.add(group);
                            }
                            return next;
                          });
                        }}
                        className="px-2 py-2 rounded-full text-slate-400 hover:text-thuy-400 transition-colors"
                        title="Xem hạng mục"
                      >
                        <ChevronDown
                          className={`w-3 h-3 ${isOpen ? "rotate-180" : ""}`}
                        />
                      </button>
                    )}

                    {isOpen && groupCategories[group] && groupCategories[group].length > 0 && (
                      <div className="absolute left-0 top-full mt-1 w-56 rounded-xl bg-thuy-900 border border-thuy-700 shadow-2xl py-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                        {groupCategories[group].map((cat) => (
                          <Link
                            key={cat}
                            href={`/products?productGroup=${encodeURIComponent(group)}&productCategory=${encodeURIComponent(cat)}`}
                            onClick={() => {
                              setOpenDesktopSub(new Set());
                              setSearchOpen(false);
                            }}
                            className="flex items-center gap-2 px-4 py-2 text-xs text-slate-300 hover:bg-thuy-800 hover:text-white transition-colors border-l-2 border-transparent hover:border-thuy-400"
                          >
                            {cat}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
          </nav>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setSearchOpen(!searchOpen)}
              className="p-2.5 rounded-full bg-thuy-850/80 hover:bg-thuy-700/80 text-slate-300 hover:text-thuy-300 border border-thuy-700/60 transition-colors"
              title="Tìm kiếm"
            >
              <Search className="w-4 h-4" />
            </button>

            {searchOpen && (
              <form
                onSubmit={handleSearchSubmit}
                className="relative w-full sm:w-80"
              >
                <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                <input
                  type="text"
                  name="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Escape") setSearchOpen(false);
                  }}
                  placeholder="Tìm CAD, 3D model..."
                  className="w-full pl-9 pr-10 py-2.5 rounded-xl bg-thuy-900 border border-thuy-700 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-thuy-400"
                />
                <button
                  type="submit"
                  className="absolute right-3 top-3 text-slate-400 hover:text-white"
                >
                  <Search className="w-3 h-3" />
                </button>
              </form>
            )}

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
            <Link
              href="/"
              onClick={() => setMobileMenuOpen(false)}
              className={
                pathname === "/"
                  ? "block px-4 py-2.5 rounded-lg text-sm font-medium bg-thuy-400 text-thuy-950 font-bold transition-colors"
                  : "block px-4 py-2.5 rounded-lg text-sm font-medium text-slate-300 hover:bg-thuy-850 transition-colors"
              }
            >
              Trang Chủ
            </Link>
            {groupsLoaded &&
              groups.map((group) => {
                const active = isActiveGroup(group);
                const isOpen = isMobileGroupOpen(group);
                return (
                  <div key={group} className="mb-1">
                    <button
                      onClick={() => toggleMobileSub(group)}
                      className={
                        active
                          ? "flex items-center justify-between px-4 py-2.5 rounded-lg text-sm font-medium bg-thuy-400 text-thuy-950 font-bold transition-colors"
                          : "flex items-center justify-between px-4 py-2.5 rounded-lg text-sm font-medium text-slate-300 hover:bg-thuy-850 transition-colors"
                      }
                    >
                      {group}
                      <ChevronDown className={`w-3.5 h-3.5 ${isOpen ? "rotate-180" : ""}`} />
                    </button>
                    {isOpen && (
                      <div className="ml-4 mt-1 space-y-1">
                        {groupCategories[group].map((cat) => (
                          <Link
                            key={cat}
                            href={`/products?productGroup=${encodeURIComponent(group)}&productCategory=${encodeURIComponent(cat)}`}
                            onClick={() => setMobileMenuOpen(false)}
                            className="block px-6 py-2 rounded-lg text-xs text-slate-400 hover:bg-thuy-800 hover:text-white transition-colors"
                          >
                            {cat}
                          </Link>
                        ))}
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

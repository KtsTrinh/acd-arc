"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useCartStore } from "@/lib/cart";
import { useCurrentUser } from "@/components/auth/useCurrentUser";
import { formatVND } from "@/lib/utils";
import { proxiedMediaUrl } from "@/lib/media-url";
import {
  ShoppingBag,
  X,
  Trash2,
  ArrowRight,
  ShieldCheck,
  Download,
  LogIn,
  AlertCircle,
  Loader2,
} from "lucide-react";

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CartDrawer({ isOpen, onClose }: CartDrawerProps) {
  const router = useRouter();
  const { items, removeItem, totalPrice, totalItems } = useCartStore();
  const { user, loading: authLoading } = useCurrentUser();
  const [mounted, setMounted] = useState(false);
  const [confirmItem, setConfirmItem] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [checkingOut, setCheckingOut] = useState(false);
  const [unavailableNames, setUnavailableNames] = useState<string[] | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleCheckout = async () => {
    if (checkingOut || items.length === 0) return;
    setCheckingOut(true);
    try {
      const results = await Promise.all(
        items.map(async (item) => {
          try {
            const res = await fetch(`/api/products/${item.id}`, { cache: "no-store" });
            const data = await res.json().catch(() => ({}));
            const p = data?.product;
            const ok = p && (p.hasFile || p.hasDownloadLink || p.fileKey || p.downloadLinkUrl);
            return { ok: Boolean(ok), name: item.name };
          } catch {
            return { ok: false, name: item.name };
          }
        })
      );
      const bad = results.filter((r) => !r.ok).map((r) => r.name);
      if (bad.length > 0) {
        setUnavailableNames(bad);
        return;
      }
      onClose();
      router.push("/checkout");
    } finally {
      setCheckingOut(false);
    }
  };

  if (!mounted || !isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-thuy-950/80 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Drawer Panel */}
      <div className="relative z-10 w-full max-w-md bg-thuy-900 border-l border-thuy-700/80 shadow-2xl flex flex-col h-full animate-in slide-in-from-right duration-300">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-thuy-700/60 bg-thuy-850/50">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-thuy-700/50 text-thuy-400">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-semibold text-lg text-white">
                Giỏ Tài Nguyên Của Bạn
              </h2>
              <p className="text-xs text-slate-400">
                {totalItems()} sản phẩm kỹ thuật số được chọn
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-thuy-700/50 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Items List */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {!authLoading && !user ? (
            <div className="text-center py-16 space-y-4">
              <div className="w-16 h-16 mx-auto rounded-full bg-thuy-800 flex items-center justify-center text-thuy-400">
                <LogIn className="w-8 h-8" />
              </div>
              <p className="text-slate-400 text-sm">
                Vui lòng đăng nhập để thêm tài nguyên vào giỏ hàng.
              </p>
              <Link
                href="/login?from=%2Fcart"
                onClick={onClose}
                className="inline-block px-5 py-2.5 rounded-lg bg-thuy-400 text-thuy-950 text-sm font-bold hover:brightness-110 shadow-glow-cyan transition-all"
              >
                Đăng nhập ngay
              </Link>
            </div>
          ) : items.length === 0 ? (
            <div className="text-center py-16 space-y-4">
              <div className="w-16 h-16 mx-auto rounded-full bg-thuy-800 flex items-center justify-center text-slate-500">
                <ShoppingBag className="w-8 h-8" />
              </div>
              <p className="text-slate-400 text-sm">
                Giỏ hàng của bạn đang trống.
              </p>
              <Link
                href="/products"
                onClick={onClose}
                className="inline-block px-5 py-2.5 rounded-lg bg-thuy-400/10 hover:bg-thuy-400/20 text-thuy-400 text-sm font-medium border border-thuy-400/30 transition-all"
              >
                Khám phá sản phẩm
              </Link>
            </div>
          ) : (
            items.map((item) => (
              <div
                key={item.id}
                className="flex gap-4 p-3.5 rounded-xl bg-thuy-850/80 border border-thuy-700/50 hover:border-thuy-600 transition-colors"
              >
                {item.thumbnail ? (
                  <div className="relative w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 bg-thuy-950">
                    <Image
                      src={proxiedMediaUrl(item.thumbnail) || item.thumbnail}
                      alt={item.name}
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  </div>
                ) : (
                  <div className="w-20 h-20 rounded-lg bg-thuy-800 flex items-center justify-center text-slate-500 flex-shrink-0">
                    <Download className="w-6 h-6" />
                  </div>
                )}

                <div className="flex-1 min-w-0 flex flex-col justify-between">
                  <div>
                    <h3 className="text-sm font-medium text-slate-100 line-clamp-2 leading-snug">
                      {item.name}
                    </h3>
                    <div className="flex items-center gap-2 mt-1 text-[11px] text-thuy-300">
                      <span className="px-1.5 py-0.5 rounded bg-thuy-800 border border-thuy-700">
                        {item.type}
                      </span>
                      {item.fileSize && <span>{item.fileSize}</span>}
                    </div>
                  </div>

                  <div className="flex items-center justify-between mt-2">
                    <span className="font-semibold text-thuy-400 text-sm">
                      {formatVND(item.price)}
                    </span>
                    <button
                      onClick={() =>
                        setConfirmItem({ id: item.id, name: item.name })
                      }
                      className="text-slate-400 hover:text-red-400 transition-colors p-1"
                      title="Xóa"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer Summary */}
        {items.length > 0 && user && (
          <div className="p-6 border-t border-thuy-700/80 bg-thuy-850/90 space-y-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-400">Tổng thanh toán:</span>
              <span className="text-xl font-bold text-white text-glow">
                {formatVND(totalPrice())}
              </span>
            </div>

            <div className="flex items-center gap-2 text-xs text-slate-400 bg-thuy-900/60 p-2.5 rounded-lg border border-thuy-700/50">
              <ShieldCheck className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <span>
                Link tải trực tiếp tốc độ cao, kích hoạt ngay sau thanh toán.
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Link
                href="/cart"
                onClick={onClose}
                className="py-2.5 px-4 rounded-xl text-center text-sm font-medium text-slate-300 bg-thuy-800 hover:bg-thuy-700 border border-thuy-700 transition-all"
              >
                Xem chi tiết giỏ
              </Link>
              <button
                type="button"
                onClick={handleCheckout}
                disabled={checkingOut}
                className="py-2.5 px-4 rounded-xl text-center text-sm font-medium text-thuy-950 bg-gradient-to-r from-thuy-400 to-aqua-400 hover:brightness-110 shadow-glow-cyan transition-all flex items-center justify-center gap-1.5 disabled:opacity-60"
              >
                {checkingOut ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <span>Thanh toán</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Confirm remove item */}
      {confirmItem && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center">
          <div
            className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200"
            onClick={() => setConfirmItem(null)}
          />
          <div className="relative w-full max-w-md mx-4 animate-in fade-in zoom-in-95 slide-in-from-bottom-2 duration-200">
            <div className="rounded-2xl border border-red-500/30 bg-gradient-to-b from-thuy-900 to-thuy-950 p-6 shadow-2xl shadow-red-950/30">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-12 h-12 rounded-2xl bg-red-500/15 border border-red-500/30 flex items-center justify-center">
                  <Trash2 className="w-6 h-6 text-red-400" />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="text-white font-semibold text-base">
                    Xóa sản phẩm khỏi giỏ hàng?
                  </h3>
                  <p className="text-slate-400 text-xs mt-1.5 leading-relaxed">
                    Bạn có chắc muốn xóa{" "}
                    <b className="text-white">{confirmItem.name}</b> khỏi giỏ
                    hàng không?
                  </p>
                </div>
              </div>
              <div className="mt-6 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setConfirmItem(null)}
                  className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-300 bg-thuy-800 hover:bg-thuy-700 border border-thuy-700 transition-all"
                >
                  Hủy
                </button>
                <button
                  type="button"
                  onClick={() => {
                    removeItem(confirmItem.id);
                    setConfirmItem(null);
                  }}
                  className="px-4 py-2.5 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-red-500 to-rose-500 hover:brightness-110 shadow-lg shadow-red-900/40 transition-all flex items-center gap-2"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Xóa khỏi giỏ
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {unavailableNames && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center">
          <div
            className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200"
            onClick={() => setUnavailableNames(null)}
          />
          <div className="relative w-full max-w-md mx-4 animate-in fade-in zoom-in-95 slide-in-from-bottom-2 duration-300">
            <div className="rounded-2xl border border-amber-500/30 bg-gradient-to-b from-thuy-900 to-thuy-950 p-6 shadow-2xl shadow-amber-950/20">
              <button
                type="button"
                onClick={() => setUnavailableNames(null)}
                className="absolute top-3 right-3 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-thuy-800 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
              <div className="flex items-start gap-4 pr-6">
                <div className="flex-shrink-0 w-12 h-12 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center">
                  <AlertCircle className="w-6 h-6 text-amber-400" />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="text-white font-semibold text-base">Sản phẩm hiện chưa kinh doanh</h3>
                  <p className="text-slate-400 text-sm mt-1.5 leading-relaxed">
                    {unavailableNames.length === 1 ? (
                      <>Sản phẩm <b className="text-white">{unavailableNames[0]}</b> hiện chưa có file/link tải nên tạm thời chưa thể thanh toán.</>
                    ) : (
                      <>Các sản phẩm sau hiện chưa có file/link tải nên tạm thời chưa thể thanh toán: <b className="text-white">{unavailableNames.join(", ")}</b>.</>
                    )}
                  </p>
                  <p className="text-slate-500 text-xs mt-2">Vui lòng xóa các sản phẩm này khỏi giỏ hàng hoặc quay lại sau.</p>
                </div>
              </div>
              <div className="mt-6 flex items-center justify-end">
                <button
                  type="button"
                  onClick={() => setUnavailableNames(null)}
                  className="px-5 py-2.5 rounded-xl text-xs font-semibold text-thuy-950 bg-gradient-to-r from-thuy-400 to-aqua-400 hover:brightness-110 shadow-glow-cyan transition-all"
                >
                  Đã hiểu
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

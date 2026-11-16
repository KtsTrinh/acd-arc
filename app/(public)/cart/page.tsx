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
  Trash2,
  ArrowRight,
  ArrowLeft,
  ShieldCheck,
  Download,
  LogIn,
  AlertCircle,
  X,
  Loader2,
} from "lucide-react";

export default function CartPage() {
  const { items, removeItem, clearCart, totalPrice, totalItems } =
    useCartStore();
  const { user, loading: authLoading } = useCurrentUser();
  const [mounted, setMounted] = useState(false);
  const [confirmItem, setConfirmItem] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [confirmClear, setConfirmClear] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || authLoading) return null;

  // Chỉ khách đã đăng nhập mới được sử dụng giỏ hàng
  if (!user) {
    return (
      <div className="pt-28 pb-24 max-w-xl mx-auto px-4 space-y-5 text-center">
        <div className="w-16 h-16 mx-auto rounded-full bg-thuy-800 flex items-center justify-center text-thuy-400">
          <LogIn className="w-8 h-8" />
        </div>
        <h1 className="font-display font-bold text-2xl text-white">
          Đăng nhập để sử dụng giỏ hàng
        </h1>
        <p className="text-xs text-slate-400">
          Giỏ hàng và việc thanh toán tài nguyên số được gắn với tài khoản của
          bạn. Vui lòng đăng nhập để tiếp tục chọn và mua bản vẽ, model 3D.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/login?from=%2Fcart"
            className="px-6 py-3 rounded-xl bg-thuy-400 text-thuy-950 font-bold text-xs uppercase tracking-wider hover:brightness-110 shadow-glow-cyan"
          >
            Đăng nhập
          </Link>
          <Link
            href="/register?from=%2Fcart"
            className="px-6 py-3 rounded-xl bg-thuy-800 text-slate-200 hover:text-white border border-thuy-700 font-bold text-xs uppercase tracking-wider"
          >
            Tạo tài khoản
          </Link>
        </div>
        <Link
          href="/products"
          className="inline-flex items-center gap-1.5 text-xs text-thuy-400 hover:underline font-semibold"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Quay lại kho tài nguyên
        </Link>
      </div>
    );
  }

  return (
    <div className="pt-28 pb-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
      <div className="space-y-2">
        <Link
          href="/products"
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-thuy-400 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Tiếp tục chọn sản phẩm</span>
        </Link>
        <h1 className="font-display font-bold text-3xl sm:text-4xl text-white">
          Giỏ Hàng Sản Phẩm
        </h1>
        <p className="text-xs sm:text-sm text-slate-400">
          Bạn đang có {totalItems()} sản phẩm trong giỏ
        </p>
      </div>

      {items.length === 0 ? (
        <div className="text-center py-24 rounded-3xl bg-thuy-850/40 border border-thuy-800 space-y-4">
          <div className="w-16 h-16 mx-auto rounded-full bg-thuy-800 flex items-center justify-center text-slate-500">
            <ShoppingBag className="w-8 h-8" />
          </div>
          <h2 className="text-lg font-semibold text-white">
            Giỏ hàng của bạn đang trống
          </h2>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            Khám phá kho sản phẩm để bổ sung vào giỏ hàng.
          </p>
          <Link
            href="/products"
            className="inline-block px-6 py-3 rounded-xl bg-thuy-400 text-thuy-950 font-bold text-xs uppercase tracking-wider hover:brightness-110 shadow-glow-cyan"
          >
            Khám phá sản phẩm
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 items-start">
          {/* Items Table / List */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-thuy-800 text-xs text-slate-400">
              <span>Sản phẩm ({items.length})</span>
              <button
                onClick={() => setConfirmClear(true)}
                className="text-red-400 hover:text-red-300 transition-colors"
              >
                Xóa tất cả
              </button>
            </div>

            <div className="space-y-3">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-2xl bg-thuy-850/80 border border-thuy-750"
                >
                  <div className="flex items-center gap-4">
                    {item.thumbnail ? (
                      <div className="relative w-20 h-20 rounded-xl overflow-hidden bg-thuy-950 flex-shrink-0">
                        <Image
                          src={
                            proxiedMediaUrl(item.thumbnail) || item.thumbnail
                          }
                          alt={item.name}
                          fill
                          className="object-cover"
                          unoptimized
                        />
                      </div>
                    ) : (
                      <div className="w-20 h-20 rounded-xl bg-thuy-800 flex items-center justify-center text-slate-500 flex-shrink-0">
                        <Download className="w-6 h-6" />
                      </div>
                    )}

                    <div className="space-y-1">
                      <span className="px-2 py-0.5 rounded bg-thuy-800 text-thuy-300 text-[10px] font-bold border border-thuy-700">
                        {item.type}
                      </span>
                      <h3 className="font-semibold text-sm text-white line-clamp-1">
                        {item.name}
                      </h3>
                      <div className="flex items-center gap-3 text-xs text-slate-400">
                        {item.fileSize && (
                          <span>Dung lượng: {item.fileSize}</span>
                        )}
                        {item.fileFormat && (
                          <span>Định dạng: {item.fileFormat}</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-0 border-thuy-800">
                    <span className="font-bold text-base text-thuy-400">
                      {formatVND(item.price)}
                    </span>
                    <button
                      onClick={() =>
                        setConfirmItem({ id: item.id, name: item.name })
                      }
                      className="p-2 text-slate-400 hover:text-red-400 transition-colors"
                      title="Xóa"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Order Summary Box */}
          <div className="p-6 rounded-2xl bg-thuy-850 border border-thuy-750 space-y-6">
            <h3 className="font-display font-bold text-lg text-white border-b border-thuy-750 pb-3">
              Tóm Tắt Đơn Hàng
            </h3>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between text-slate-300">
                <span>Số lượng sản phẩm:</span>
                <span className="font-semibold text-white">{totalItems()}</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Hình thức giao nhận:</span>
                <span className="text-emerald-400 font-medium">
                  Tải trực tiếp (Kỹ thuật số)
                </span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Thời hạn hiệu lực link:</span>
                <span className="text-thuy-300 font-medium">72 Giờ</span>
              </div>
              <div className="pt-3 border-t border-thuy-750 flex justify-between items-baseline">
                <span className="text-sm font-semibold text-white">
                  Tổng cộng:
                </span>
                <span className="font-display font-bold text-2xl text-thuy-400 text-glow">
                  {formatVND(totalPrice())}
                </span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-thuy-900 border border-thuy-800 flex items-start gap-2.5 text-xs text-slate-400">
              <ShieldCheck className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
              <span>
                Thanh toán an toàn qua chuyển khoản ngân hàng hoặc mã VietQR.
                Quyền tải kích hoạt ngay sau xác nhận.
              </span>
            </div>

            <button
              type="button"
              onClick={handleProceedCheckout}
              disabled={checkingOut}
              className="w-full py-3.5 px-6 rounded-xl font-bold text-xs uppercase tracking-wider text-thuy-950 bg-gradient-to-r from-thuy-400 to-aqua-400 hover:brightness-110 shadow-glow-cyan transition-all flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {checkingOut ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Đang kiểm tra...</span>
                </>
              ) : (
                <>
                  <span>Tiến Hành Thanh Toán</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </div>
      )}
      {/* Confirm remove item */}
      {confirmItem && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center">
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

      {/* Confirm clear cart */}
      {confirmClear && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center">
          <div
            className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200"
            onClick={() => setConfirmClear(false)}
          />
          <div className="relative w-full max-w-md mx-4 animate-in fade-in zoom-in-95 slide-in-from-bottom-2 duration-200">
            <div className="rounded-2xl border border-red-500/30 bg-gradient-to-b from-thuy-900 to-thuy-950 p-6 shadow-2xl shadow-red-950/30">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-12 h-12 rounded-2xl bg-red-500/15 border border-red-500/30 flex items-center justify-center">
                  <Trash2 className="w-6 h-6 text-red-400" />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="text-white font-semibold text-base">
                    Xóa tất cả sản phẩm?
                  </h3>
                  <p className="text-slate-400 text-xs mt-1.5 leading-relaxed">
                    Bạn có chắc muốn xóa toàn bộ{" "}
                    <b className="text-white">{items.length} sản phẩm</b> khỏi
                    giỏ hàng không? Hành động này không thể hoàn tác.
                  </p>
                </div>
              </div>
              <div className="mt-6 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setConfirmClear(false)}
                  className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-300 bg-thuy-800 hover:bg-thuy-700 border border-thuy-700 transition-all"
                >
                  Hủy
                </button>
                <button
                  type="button"
                  onClick={() => {
                    clearCart();
                    setConfirmClear(false);
                  }}
                  className="px-4 py-2.5 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-red-500 to-rose-500 hover:brightness-110 shadow-lg shadow-red-900/40 transition-all flex items-center gap-2"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Xóa tất cả
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {unavailableNames && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center">
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

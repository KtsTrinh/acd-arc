"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useCartStore } from "@/lib/cart";
import { formatVND } from "@/lib/utils";
import { ShoppingBag, Trash2, ArrowRight, ArrowLeft, ShieldCheck, Download } from "lucide-react";

export default function CartPage() {
  const { items, removeItem, clearCart, totalPrice, totalItems } = useCartStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="pt-28 pb-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
      <div className="space-y-2">
        <Link
          href="/products"
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-thuy-400 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Tiếp tục chọn tài nguyên</span>
        </Link>
        <h1 className="font-display font-bold text-3xl sm:text-4xl text-white">
          Giỏ Hàng Tài Nguyên Kỹ Thuật Số
        </h1>
        <p className="text-xs sm:text-sm text-slate-400">
          Bạn đang có {totalItems()} sản phẩm kỹ thuật số trong giỏ
        </p>
      </div>

      {items.length === 0 ? (
        <div className="text-center py-24 rounded-3xl bg-thuy-850/40 border border-thuy-800 space-y-4">
          <div className="w-16 h-16 mx-auto rounded-full bg-thuy-800 flex items-center justify-center text-slate-500">
            <ShoppingBag className="w-8 h-8" />
          </div>
          <h2 className="text-lg font-semibold text-white">Giỏ hàng của bạn đang trống</h2>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            Khám phá kho bản vẽ AutoCAD, model 3ds Max/SketchUp và thư viện nội thất để bổ sung vào giỏ hàng.
          </p>
          <Link
            href="/products"
            className="inline-block px-6 py-3 rounded-xl bg-thuy-400 text-thuy-950 font-bold text-xs uppercase tracking-wider hover:brightness-110 shadow-glow-cyan"
          >
            Khám phá kho CAD & 3D
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 items-start">
          {/* Items Table / List */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-thuy-800 text-xs text-slate-400">
              <span>Sản phẩm ({items.length})</span>
              <button
                onClick={clearCart}
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
                          src={item.thumbnail}
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
                        {item.fileSize && <span>Dung lượng: {item.fileSize}</span>}
                        {item.fileFormat && <span>Định dạng: {item.fileFormat}</span>}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-0 border-thuy-800">
                    <span className="font-bold text-base text-thuy-400">
                      {formatVND(item.price)}
                    </span>
                    <button
                      onClick={() => removeItem(item.id)}
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
                <span className="text-emerald-400 font-medium">Tải trực tiếp (Kỹ thuật số)</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Thời hạn hiệu lực link:</span>
                <span className="text-thuy-300 font-medium">72 Giờ</span>
              </div>
              <div className="pt-3 border-t border-thuy-750 flex justify-between items-baseline">
                <span className="text-sm font-semibold text-white">Tổng cộng:</span>
                <span className="font-display font-bold text-2xl text-thuy-400 text-glow">
                  {formatVND(totalPrice())}
                </span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-thuy-900 border border-thuy-800 flex items-start gap-2.5 text-xs text-slate-400">
              <ShieldCheck className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
              <span>
                Thanh toán an toàn qua chuyển khoản ngân hàng hoặc mã VietQR. Quyền tải kích hoạt
                ngay sau xác nhận.
              </span>
            </div>

            <Link
              href="/checkout"
              className="w-full py-3.5 px-6 rounded-xl font-bold text-xs uppercase tracking-wider text-thuy-950 bg-gradient-to-r from-thuy-400 to-aqua-400 hover:brightness-110 shadow-glow-cyan transition-all flex items-center justify-center gap-2"
            >
              <span>Tiến Hành Thanh Toán</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}


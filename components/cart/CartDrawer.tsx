"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useCartStore } from "@/lib/cart";
import { formatVND } from "@/lib/utils";
import { ShoppingBag, X, Trash2, ArrowRight, ShieldCheck, Download } from "lucide-react";

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CartDrawer({ isOpen, onClose }: CartDrawerProps) {
  const { items, removeItem, totalPrice, totalItems } = useCartStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

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
              <h2 className="font-semibold text-lg text-white">Giỏ Tài Nguyên Của Bạn</h2>
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
          {items.length === 0 ? (
            <div className="text-center py-16 space-y-4">
              <div className="w-16 h-16 mx-auto rounded-full bg-thuy-800 flex items-center justify-center text-slate-500">
                <ShoppingBag className="w-8 h-8" />
              </div>
              <p className="text-slate-400 text-sm">Giỏ hàng của bạn đang trống.</p>
              <Link
                href="/products"
                onClick={onClose}
                className="inline-block px-5 py-2.5 rounded-lg bg-thuy-400/10 hover:bg-thuy-400/20 text-thuy-400 text-sm font-medium border border-thuy-400/30 transition-all"
              >
                Khám phá kho CAD & 3D
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
                      src={item.thumbnail}
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
                      onClick={() => removeItem(item.id)}
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
        {items.length > 0 && (
          <div className="p-6 border-t border-thuy-700/80 bg-thuy-850/90 space-y-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-400">Tổng thanh toán:</span>
              <span className="text-xl font-bold text-white text-glow">
                {formatVND(totalPrice())}
              </span>
            </div>

            <div className="flex items-center gap-2 text-xs text-slate-400 bg-thuy-900/60 p-2.5 rounded-lg border border-thuy-700/50">
              <ShieldCheck className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <span>Link tải trực tiếp tốc độ cao, kích hoạt ngay sau thanh toán.</span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Link
                href="/cart"
                onClick={onClose}
                className="py-2.5 px-4 rounded-xl text-center text-sm font-medium text-slate-300 bg-thuy-800 hover:bg-thuy-700 border border-thuy-700 transition-all"
              >
                Xem chi tiết giỏ
              </Link>
              <Link
                href="/checkout"
                onClick={onClose}
                className="py-2.5 px-4 rounded-xl text-center text-sm font-medium text-thuy-950 bg-gradient-to-r from-thuy-400 to-aqua-400 hover:brightness-110 shadow-glow-cyan transition-all flex items-center justify-center gap-1.5"
              >
                <span>Thanh toán</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}


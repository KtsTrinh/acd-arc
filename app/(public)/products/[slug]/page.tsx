"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCartStore } from "@/lib/cart";
import { useCurrentUser } from "@/components/auth/useCurrentUser";
import { formatVND } from "@/lib/utils";
import {
  Download,
  ShoppingBag,
  ArrowRight,
  ShieldCheck,
  Clock,
  Layers,
  CheckCircle,
  FileCode,
  ArrowLeft,
  Sparkles,
  LogIn,
} from "lucide-react";

export default function ProductDetailPage({ params }: { params: { slug: string } }) {
  const router = useRouter();
  const { addItem } = useCartStore();
  const { user, loading: authLoading } = useCurrentUser();
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [added, setAdded] = useState(false);

  const isLoggedIn = Boolean(user);
  const currentPath = `/products/${params.slug}`;

  useEffect(() => {
    fetch(`/api/products/${params.slug}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.product) setProduct(data.product);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [params.slug]);

  if (loading) {
    return (
      <div className="pt-36 pb-20 text-center text-slate-400">
        Đang tải thông tin tài nguyên...
      </div>
    );
  }

  if (!product) {
    return (
      <div className="pt-36 pb-20 text-center space-y-4">
        <h2 className="text-xl text-white">Không tìm thấy sản phẩm.</h2>
        <Link href="/products" className="text-thuy-400 text-sm underline">
          Quay lại kho tài nguyên
        </Link>
      </div>
    );
  }

  /** Khách chưa đăng nhập sẽ được đưa tới trang đăng nhập rồi quay lại sản phẩm */
  const requireLogin = () => {
    router.push(`/login?from=${encodeURIComponent(currentPath)}`);
  };

  const addToCart = () => {
    addItem({
      id: product.id,
      name: product.name,
      slug: product.slug,
      price: product.price,
      type: product.type,
      fileFormat: product.fileFormat,
      fileSize: product.fileSize,
      thumbnail: product.thumbnail,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 3000);
  };

  const handleAddToCart = () => {
    if (!isLoggedIn) {
      requireLogin();
      return;
    }
    addToCart();
  };

  const handleBuyNow = () => {
    if (!isLoggedIn) {
      requireLogin();
      return;
    }
    addToCart();
    router.push("/checkout");
  };

  return (
    <div className="pt-28 pb-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
      {/* Breadcrumb */}
      <Link
        href="/products"
        className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-thuy-400 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Quay lại danh mục tài nguyên</span>
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
        {/* Left: Product Thumbnail / Preview */}
        <div className="space-y-4">
          <div className="relative aspect-[4/3] rounded-3xl overflow-hidden bg-thuy-950 border border-thuy-750 shadow-2xl">
            {product.thumbnail ? (
              <Image
                src={product.thumbnail}
                alt={product.name}
                fill
                className="object-cover"
                priority
                unoptimized
              />
            ) : (
              <div className="w-full h-full bg-thuy-900 flex items-center justify-center text-slate-500">
                <Download className="w-12 h-12 text-slate-600" />
              </div>
            )}
            <span className="absolute top-4 left-4 px-3 py-1 rounded-full bg-thuy-950/85 backdrop-blur-md border border-thuy-700 text-xs font-bold text-thuy-300">
              {product.type}
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-thuy-850/60 border border-thuy-750 flex items-center justify-between text-xs text-slate-300">
            <span className="flex items-center gap-1.5">
              <FileCode className="w-4 h-4 text-thuy-400" />
              <b>Định dạng:</b> {product.fileFormat || "Tiêu chuẩn ACD"}
            </span>
            {product.fileSize && (
              <span className="flex items-center gap-1.5">
                <Download className="w-4 h-4 text-thuy-400" />
                <b>Dung lượng:</b> {product.fileSize}
              </span>
            )}
          </div>
        </div>

        {/* Right: Pricing, Info, and Actions */}
        <div className="space-y-8">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-thuy-800 text-thuy-300 text-xs border border-thuy-700">
              <Sparkles className="w-3.5 h-3.5 text-thuy-400" />
              <span>Tài Nguyên Kiến Trúc Bản Quyền ACD</span>
            </div>

            <h1 className="font-display font-bold text-2xl sm:text-4xl text-white leading-snug">
              {product.name}
            </h1>

            {/* Price section */}
            <div className="flex items-baseline gap-4 pt-2">
              <span className="font-display font-bold text-3xl sm:text-4xl text-thuy-400 text-glow">
                {formatVND(product.price)}
              </span>
              {product.comparePrice && (
                <span className="text-sm text-slate-500 line-through">
                  {formatVND(product.comparePrice)}
                </span>
              )}
            </div>
          </div>

          {/* Description */}
          <div className="p-6 rounded-2xl bg-thuy-850/80 border border-thuy-750 space-y-4">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-thuy-300">
              Mô Tả & Nội Dung Gói File:
            </h3>
            <p className="text-sm text-slate-300 leading-relaxed font-light">
              {product.description ||
                "Bộ hồ sơ kỹ thuật bao gồm đầy đủ các bản vẽ chi tiết phục vụ cho công tác thiết kế, xin phép và thi công thực tế."}
            </p>
          </div>

          {/* Security & Download Guarantee */}
          <div className="p-4 rounded-xl bg-thuy-900 border border-thuy-800 space-y-2 text-xs text-slate-300">
            <div className="flex items-center gap-2 text-emerald-400 font-semibold">
              <ShieldCheck className="w-4 h-4" />
              <span>Chính sách cấp quyền tải kỹ thuật số:</span>
            </div>
            <ul className="space-y-1.5 pl-6 list-disc text-slate-400">
              <li>Link tải được tạo tự động ngay sau khi xác nhận thanh toán.</li>
              <li>Hiệu lực liên kết tải: <b>72 giờ</b> kể từ thời điểm mua.</li>
              <li>Số lượt tải tối đa: <b>5 lần</b> (phục vụ dự phòng và lưu trữ).</li>
              <li>Hệ thống lưu lịch sử đơn hàng tại trang tài khoản khách hàng.</li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3 pt-2">
            {!authLoading && !isLoggedIn && (
              <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/40 text-xs text-amber-300 flex items-start gap-2.5">
                <LogIn className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>
                  Bạn cần <b>đăng nhập</b> để thêm tài nguyên vào giỏ hàng và
                  thanh toán. Sau khi đăng nhập bạn sẽ được đưa trở lại trang này.
                </span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <button
                onClick={handleAddToCart}
                disabled={!authLoading && !isLoggedIn}
                className="py-3.5 px-6 rounded-xl font-bold text-xs uppercase tracking-wider text-slate-200 bg-thuy-800 hover:bg-thuy-750 border border-thuy-700 transition-all flex items-center justify-center gap-2 hover:border-thuy-500 disabled:opacity-60"
              >
                {isLoggedIn ? (
                  <ShoppingBag className="w-4 h-4 text-thuy-400" />
                ) : (
                  <LogIn className="w-4 h-4 text-thuy-400" />
                )}
                <span>
                  {added
                    ? "Đã thêm vào giỏ ✓"
                    : isLoggedIn
                    ? "Thêm vào giỏ"
                    : "Đăng nhập để thêm giỏ"}
                </span>
              </button>

              <button
                onClick={handleBuyNow}
                className="py-3.5 px-6 rounded-xl font-bold text-xs uppercase tracking-wider text-thuy-950 bg-gradient-to-r from-thuy-400 to-aqua-400 hover:brightness-110 shadow-glow-cyan transition-all flex items-center justify-center gap-2"
              >
                <span>
                  {isLoggedIn ? "Mua ngay & Nhận file" : "Đăng nhập & Mua ngay"}
                </span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            {added && (
              <p className="text-xs text-emerald-400 text-center animate-in fade-in">
                Sản phẩm đã được thêm vào giỏ hàng thành công!
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}


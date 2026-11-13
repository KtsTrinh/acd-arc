"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCartStore } from "@/lib/cart";
import { useCurrentUser } from "@/components/auth/useCurrentUser";
import { formatVND, numberToWordsVN } from "@/lib/utils";
import {
  Download,
  ShoppingBag,
  ArrowRight,
  ShieldCheck,
  FileCode,
  ArrowLeft,
  Sparkles,
  LogIn,
  MapPin,
  User,
  Calendar,
  Ruler,
  Layers,
  Tag,
  Images,
} from "lucide-react";
import {
  isLikelyVideoUrl,
  normalizeMediaUrl,
  proxiedMediaUrl,
  playableVideoUrl,
  resolveHeroVideo,
} from "@/lib/media-url";

function InfoRow({
  label,
  value,
}: {
  label: string;
  value?: string | number | null;
}) {
  if (value === null || value === undefined || value === "") return null;
  return (
    <div className="flex items-start justify-between gap-4 py-2 border-b border-thuy-800/60 last:border-0">
      <span className="text-xs text-slate-400 shrink-0">{label}</span>
      <span className="text-xs text-white font-medium text-right">{value}</span>
    </div>
  );
}

export default function ProductDetailPage({ params }: { params: { slug: string } }) {
  const router = useRouter();
  const { addItem } = useCartStore();
  const { user, loading: authLoading } = useCurrentUser();
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [added, setAdded] = useState(false);
  const [activeImage, setActiveImage] = useState<string | null>(null);

  const isLoggedIn = Boolean(user);
  const currentPath = `/products/${params.slug}`;

  useEffect(() => {
    fetch(`/api/products/${params.slug}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.product) {
          setProduct(data.product);
          setActiveImage(data.product.thumbnail || null);
        }
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

  const requireLogin = () => {
    router.push(`/login?from=${encodeURIComponent(currentPath)}`);
  };

  const addToCart = () => {
    addItem({
      id: product.id,
      name: product.name,
      slug: product.slug,
      price: product.priceAfterDiscount ?? product.price ?? 0,
      type: product.productGroup || "DIGITAL_FILE",
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

  const gallery: any[] = Array.isArray(product.gallery) ? product.gallery : [];
  const galleryMedia = gallery
    .map((g: any) => {
      const url = g?.media?.url || "";
      if (!url) return null;
      return { url, mimeType: g?.media?.mimeType || null };
    })
    .filter(Boolean) as { url: string; mimeType: string | null }[];

  const thumbUrl = product.thumbnail || "";
  const allMedia: { url: string; mimeType: string | null }[] = [];
  if (thumbUrl) allMedia.push({ url: thumbUrl, mimeType: null });
  allMedia.push(...galleryMedia);
  const seen = new Set<string>();
  const uniqueMedia = allMedia.filter((m) => {
    if (seen.has(m.url)) return false;
    seen.add(m.url);
    return true;
  });

  const active = activeImage || thumbUrl || uniqueMedia[0]?.url || null;
  const activeMedia = uniqueMedia.find((m) => m.url === active) || (active ? { url: active, mimeType: null } : null);
  const activeIsVideo = activeMedia ? isLikelyVideoUrl(activeMedia.url, activeMedia.mimeType) : false;
  const activeSrc = activeMedia ? proxiedMediaUrl(activeMedia.url, activeMedia.mimeType) : "";

  const tags: string[] = Array.isArray(product.tags)
    ? product.tags.map((t: any) => t?.tag?.name || t?.name).filter(Boolean)
    : [];
  const finalPrice = product.priceAfterDiscount ?? product.price ?? 0;
  const hasDiscount =
    product.discount && product.price && product.priceAfterDiscount != null;

  return (
    <div className="pt-28 pb-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
      <Link
        href="/products"
        className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-thuy-400 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Quay lại danh mục tài nguyên</span>
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
        {/* Left: Images & Gallery */}
        <div className="space-y-4">
          <div className="relative aspect-[4/3] rounded-3xl overflow-hidden bg-thuy-950 border border-thuy-750 shadow-2xl">
            {activeSrc && !activeIsVideo ? (
              <Image
                src={activeSrc}
                alt={product.name}
                fill
                className="object-cover"
                priority
                unoptimized
              />
            ) : activeSrc && activeIsVideo ? (
              <video
                src={activeSrc}
                className="w-full h-full object-cover"
                controls
                playsInline
              />
            ) : (
              <div className="w-full h-full bg-thuy-900 flex items-center justify-center text-slate-500">
                <Download className="w-12 h-12 text-slate-600" />
              </div>
            )}

          </div>

          {uniqueMedia.length > 1 && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <Images className="w-4 h-4 text-thuy-400" />
                <span>Thư viện hình ảnh ({uniqueMedia.length})</span>
              </div>
              <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
                {uniqueMedia.map((m, idx) => {
                  const src = proxiedMediaUrl(m.url, m.mimeType);
                  const isVid = isLikelyVideoUrl(m.url, m.mimeType);
                  const selected = active === m.url;
                  return (
                    <button
                      key={`${m.url}-${idx}`}
                      type="button"
                      onClick={() => setActiveImage(m.url)}
                      className={`relative aspect-square rounded-xl overflow-hidden border transition-all ${
                        selected
                          ? "border-thuy-400 ring-1 ring-thuy-400"
                          : "border-thuy-700 hover:border-thuy-500"
                      }`}
                    >
                      {isVid ? (
                        <video src={src} className="w-full h-full object-cover" muted playsInline />
                      ) : (
                        <Image src={src} alt="" fill className="object-cover" unoptimized />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Right: Info & Actions */}
        <div className="space-y-6">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-thuy-800 text-thuy-300 text-xs border border-thuy-700">
                <Sparkles className="w-3.5 h-3.5 text-thuy-400" />
                <span>Tài nguyên bản quyền ACD</span>
              </div>

              {product.featured && (
                <span className="px-3 py-1 rounded-full bg-amber-500/15 text-amber-300 text-xs border border-amber-500/30">
                  Nổi bật
                </span>
              )}
            </div>

            <h1 className="font-display font-bold text-2xl sm:text-4xl text-white leading-snug">
              {product.name}
            </h1>

            {product.shortDesc && (
              <p className="text-sm text-slate-300 leading-relaxed">
                {product.shortDesc}
              </p>
            )}

            <div className="space-y-2 pt-1">
              {hasDiscount ? (
                <div className="flex flex-wrap items-baseline gap-x-4 gap-y-2">
                  <span className="text-base text-slate-300">
                    Giá bán:{" "}
                    <span className="line-through decoration-slate-400/80 text-slate-400">
                      {formatVND(product.price)}
                    </span>
                  </span>
                  <span className="text-sm text-red-300 font-medium">
                    Giảm giá: -{formatVND(product.discount)} (
                    {Math.round((product.discount / product.price) * 100)}%)
                  </span>
                  <span className="font-display font-bold text-2xl sm:text-3xl text-thuy-400 text-glow">
                    Giá sau giảm: {formatVND(finalPrice || 0)}
                  </span>
                </div>
              ) : (
                <div className="font-display font-bold text-3xl sm:text-4xl text-thuy-400 text-glow">
                  Giá bán: {formatVND(finalPrice || 0)}
                </div>
              )}
              <p className="text-xs text-slate-300 leading-relaxed break-words">
                Số tiền bằng chữ:{" "}
                <span className="text-thuy-400 font-medium">
                  {(() => {
                    const words = numberToWordsVN(finalPrice || 0);
                    return words.charAt(0).toUpperCase() + words.slice(1);
                  })()}{" "}
                  đồng
                </span>
              </p>
            </div>
          </div>

          {tags.length > 0 && (
            <div className="flex flex-wrap items-center gap-2">
              <Tag className="w-4 h-4 text-thuy-400" />
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="px-2.5 py-1 rounded-full bg-thuy-850 border border-thuy-700 text-[11px] text-slate-300"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* Project / product info */}
          <div className="p-5 rounded-2xl bg-thuy-850/80 border border-thuy-750 space-y-1">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-thuy-300 mb-2">
              Thông tin chi tiết
            </h3>
            <InfoRow label="Chủ đầu tư" value={product.client} />
            <InfoRow label="Địa điểm" value={product.location} />
            <InfoRow label="Năm thiết kế" value={product.year} />
            <InfoRow
              label="Diện tích đất"
              value={product.landArea ? `${product.landArea} m²` : null}
            />
            <InfoRow
              label="Diện tích xây dựng"
              value={product.buildingArea ? `${product.buildingArea} m²` : null}
            />
            <InfoRow label="Tầng cao" value={product.floors} />
            <InfoRow label="Tầng hầm" value={product.basementFloors} />
            <InfoRow
              label="Tổng diện tích sàn"
              value={product.totalFloorArea ? `${product.totalFloorArea} m²` : null}
            />
            <InfoRow label="Phong cách" value={product.style} />
            <InfoRow label="Định dạng file" value={product.fileFormat} />
            <InfoRow label="Dung lượng" value={product.fileSize} />
          </div>

          {/* Description */}
          <div className="p-6 rounded-2xl bg-thuy-850/80 border border-thuy-750 space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-thuy-300">
              Mô tả chi tiết
            </h3>
            <p className="text-sm text-slate-300 leading-relaxed font-light whitespace-pre-line">
              {product.description ||
                "Bộ hồ sơ kỹ thuật bao gồm đầy đủ các bản vẽ chi tiết phục vụ cho công tác thiết kế, xin phép và thi công thực tế."}
            </p>
          </div>

          {/* Download policy */}
          <div className="p-4 rounded-xl bg-thuy-900 border border-thuy-800 space-y-2 text-xs text-slate-300">
            <div className="flex items-center gap-2 text-emerald-400 font-semibold">
              <ShieldCheck className="w-4 h-4" />
              <span>Chính sách cấp quyền tải kỹ thuật số:</span>
            </div>
            <ul className="space-y-1.5 pl-6 list-disc text-slate-400">
              <li>Link tải được tạo tự động sau khi xác nhận thanh toán.</li>
              <li>
                Chỉ <b className="text-white">tài khoản đã thanh toán</b> mới tải được.
              </li>
              <li>Số lượt tải tối đa: <b>5 lần</b>.</li>
              {product.downloadExpiresMinutes && (
                <li>Link có hiệu lực trong <b>{product.downloadExpiresMinutes} phút</b>.</li>
              )}
            </ul>
          </div>

          {/* Actions */}
          <div className="space-y-3 pt-1">
            {!authLoading && !isLoggedIn && (
              <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/40 text-xs text-amber-300 flex items-start gap-2.5">
                <LogIn className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>
                  Bạn cần <b>đăng nhập</b> để thêm tài nguyên vào giỏ hàng và thanh toán.
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


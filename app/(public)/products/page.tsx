import React from "react";
import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import { formatVND } from "@/lib/utils";
import { proxiedMediaUrl, isLikelyVideoUrl } from "@/lib/media-url";
import {
  Download,
  Search,
  ArrowRight,
  MapPin,
  Calendar,
  Tag,
  Ruler,
} from "lucide-react";

export const revalidate = 0;

interface ProductsPageProps {
  searchParams: {
    productGroup?: string;
    productCategory?: string;
    search?: string;
  };
}

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const { productGroup, productCategory, search } = searchParams;

  const where: any = { active: true };
  if (productGroup) {
    where.productGroup = productGroup;
  }
  if (productCategory) {
    where.productCategory = productCategory;
  }
  if (search) {
    where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { description: { contains: search, mode: "insensitive" } },
      { shortDesc: { contains: search, mode: "insensitive" } },
      { fileFormat: { contains: search, mode: "insensitive" } },
      { location: { contains: search, mode: "insensitive" } },
      { client: { contains: search, mode: "insensitive" } },
      { style: { contains: search, mode: "insensitive" } },
      { productGroup: { contains: search, mode: "insensitive" } },
      { productCategory: { contains: search, mode: "insensitive" } },
    ];
  }

  const [products, groups] = await Promise.all([
    prisma.product.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        tags: { include: { tag: true } },
        gallery: {
          include: { media: { select: { url: true, mimeType: true } } },
          orderBy: { sortOrder: "asc" },
          take: 1,
        },
      },
    }) as any,
    prisma.product.groupBy({
      by: ["productGroup"],
      where: { active: true, productGroup: { not: null } },
      _count: { _all: true },
      orderBy: { productGroup: "asc" },
    }).catch(() => [] as any[]),
  ]);

  const productGroups = (groups as any[])
    .map((g) => ({ name: String(g.productGroup || "").trim(), count: g?._count?._all || 0 }))
    .filter((g) => g.name);

  return (
    <div className="pt-28 pb-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
      <div className="space-y-3">
        <span className="text-xs text-thuy-400 uppercase tracking-widest font-semibold block">
          Sản phẩm & tài nguyên
        </span>
        <h1 className="font-display font-bold text-3xl sm:text-5xl text-white">
          Danh mục sản phẩm
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 max-w-2xl font-light">
          Khám phá các sản phẩm từ ACD Studio.
        </p>
      </div>

      <div className="p-4 rounded-2xl bg-thuy-850/80 border border-thuy-750 backdrop-blur-md space-y-4">
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
            <Link
              href="/products"
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                !productGroup
                  ? "bg-thuy-400 text-thuy-950 shadow-glow-cyan"
                  : "bg-thuy-900 text-slate-400 hover:text-white border border-thuy-700"
              }`}
            >
              <span>Tất cả</span>
            </Link>
            {productGroups.map((g) => {
              const isActive = productGroup === g.name;
              return (
                <Link
                  key={g.name}
                  href={`/products?productGroup=${encodeURIComponent(g.name)}`}
                  className={`whitespace-nowrap px-4 py-2 rounded-lg text-xs font-semibold transition-colors ${
                    isActive
                      ? "bg-thuy-400 text-thuy-950"
                      : "bg-thuy-850 border border-thuy-700 text-slate-300 hover:border-thuy-500"
                  }`}
                >
                  {g.name} ({g.count})
                </Link>
              );
            })}
          </div>

          <form method="GET" className="relative w-full sm:w-72">
            {productGroup ? <input type="hidden" name="productGroup" value={productGroup} /> : null}
            {productCategory ? <input type="hidden" name="productCategory" value={productCategory} /> : null}
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              name="search"
              defaultValue={search || ""}
              placeholder="Tìm sản phẩm..."
              className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-thuy-900 border border-thuy-700 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-thuy-400"
            />
          </form>
        </div>
      </div>

      <div className="space-y-6">
        <div className="flex items-center justify-between text-xs text-slate-400">
          <span>
            Tìm thấy <b className="text-thuy-400 font-semibold">{products.length}</b> sản phẩm
          </span>
          {(productGroup || productCategory) && (
            <span className="text-slate-300">
              {productGroup}
              {productCategory ? ` / ${productCategory}` : ""}
            </span>
          )}
        </div>

        {products.length === 0 ? (
          <div className="text-center py-20 rounded-2xl bg-thuy-850/40 border border-thuy-800 space-y-3">
            <p className="text-slate-400 text-sm">Không tìm thấy sản phẩm phù hợp.</p>
            <Link
              href="/products"
              className="inline-block px-4 py-2 rounded-lg bg-thuy-400 text-thuy-950 font-semibold text-xs"
            >
              Xem tất cả sản phẩm
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.map((prod: any) => {
              const finalPrice = prod.priceAfterDiscount ?? prod.price ?? 0;
              const tags = (prod.tags || []).map((t: any) => t?.tag?.name).filter(Boolean).slice(0, 3);
              const thumbUrl = prod.thumbnail || prod.gallery?.[0]?.media?.url || "";
              const thumbMime = prod.gallery?.[0]?.media?.mimeType || null;
               const thumbIsVideo = thumbUrl === prod.thumbnail
                 ? Boolean(prod.thumbnailIsVideo)
                 : isLikelyVideoUrl(thumbUrl, thumbMime);
               const thumbSrc = thumbIsVideo && !/drive\.google\.com/i.test(thumbUrl)
                 ? thumbUrl
                 : proxiedMediaUrl(thumbUrl, thumbMime);
              return (
                <div
                  key={prod.id}
                  className="group flex flex-col justify-between rounded-2xl bg-thuy-850/70 border border-thuy-750 p-4 hover:border-thuy-400 transition-all duration-300 hover:shadow-card-dark"
                >
                  <div className="space-y-3">
                    <div className="relative aspect-[4/3] rounded-xl overflow-hidden bg-thuy-950">
                      {thumbUrl ? (
                        thumbIsVideo ? (
                          <video
                            src={thumbSrc}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            muted
                            playsInline
                            preload="metadata"
                          />
                        ) : (
                          <Image
                            src={thumbSrc}
                            alt={prod.name}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-500"
                            unoptimized
                          />
                        )
                      ) : (
                        <div className="w-full h-full bg-thuy-800 flex items-center justify-center text-slate-500">
                          <Download className="w-6 h-6" />
                        </div>
                      )}
                      <span className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded bg-thuy-950/85 backdrop-blur-sm border border-thuy-700 text-[10px] font-bold text-thuy-300 whitespace-nowrap max-w-[70%] truncate">
                        {prod.productCategory || prod.productGroup || "Sản phẩm"}
                      </span>
                      {prod.fileSize && (
                        <span className="absolute bottom-2.5 right-2.5 px-2 py-0.5 rounded bg-thuy-950/85 text-[10px] text-slate-300 border border-thuy-700">
                          {prod.fileSize}
                        </span>
                      )}
                    </div>

                    <div className="space-y-1.5">
                      <h3 className="font-semibold text-sm text-white line-clamp-2 leading-snug group-hover:text-thuy-300 transition-colors">
                        {prod.name}
                      </h3>
                      {prod.shortDesc && (
                        <p className="text-[11px] text-slate-300 line-clamp-2">{prod.shortDesc}</p>
                      )}
                      <p className="text-[11px] text-slate-400 line-clamp-2">
                        {prod.fileFormat || prod.description || "—"}
                      </p>
                      <div className="flex flex-wrap gap-x-3 gap-y-1 text-[10px] text-slate-400">
                        {prod.location && (
                          <span className="inline-flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {prod.location}
                          </span>
                        )}
                        {prod.year && (
                          <span className="inline-flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {prod.year}
                          </span>
                        )}
                        {prod.totalFloorArea ? (
                          <span className="inline-flex items-center gap-1">
                            <Ruler className="w-3 h-3" />
                            {prod.totalFloorArea} m²
                          </span>
                        ) : prod.landArea ? (
                          <span className="inline-flex items-center gap-1">
                            <Ruler className="w-3 h-3" />
                            {prod.landArea} m²
                          </span>
                        ) : null}
                      </div>
                      {tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 pt-0.5">
                          {tags.map((t: string) => (
                            <span
                              key={t}
                              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-thuy-900 border border-thuy-700 text-[10px] text-slate-300"
                            >
                              <Tag className="w-2.5 h-2.5" />
                              {t}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="pt-4 mt-4 border-t border-thuy-800 space-y-1.5">
                    <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1 text-xs min-w-0">
                      {prod.discount && prod.price ? (
                        <>
                          <span className="text-slate-400 line-through decoration-slate-400/70 whitespace-nowrap">
                            Giá bán: {formatVND(prod.price)}
                          </span>
                          <span className="text-red-300 whitespace-nowrap">
                            Giảm: -{formatVND(prod.discount)} ({Math.round((prod.discount / prod.price) * 100)}%)
                          </span>
                          <span className="font-bold text-base text-thuy-400 whitespace-nowrap">
                            Sau giảm: {formatVND(finalPrice)}
                          </span>
                        </>
                      ) : (
                        <span className="font-bold text-base text-thuy-400 whitespace-nowrap">
                          Giá bán: {formatVND(finalPrice)}
                        </span>
                      )}
                    </div>
                    <div className="pt-1">
                      <Link
                        href={`/products/${prod.slug}`}
                        className="inline-flex items-center gap-1 px-3.5 py-1.5 rounded-lg bg-thuy-800 hover:bg-thuy-400 hover:text-thuy-950 text-slate-200 text-xs font-semibold transition-all"
                      >
                        <span>Xem chi tiết</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}


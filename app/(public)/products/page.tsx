import React from "react";
import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import { formatVND } from "@/lib/utils";
import { CATALOG_GROUPS } from "@/lib/catalog";
import {
  Download,
  Filter,
  Search,
  ArrowRight,
  Layers,
  Building2,
  Layout,
  HardHat,
  FileCode,
} from "lucide-react";

export const revalidate = 0;

interface ProductsPageProps {
  searchParams: {
    type?: string;
    productGroup?: string;
    productCategory?: string;
    search?: string;
  };
}

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const { type, productGroup, productCategory, search } = searchParams;

  const where: any = { active: true };
  if (productGroup) {
    where.productGroup = productGroup;
    if (productCategory) {
      where.productCategory = productCategory;
    }
  } else if (type && type !== "ALL") {
    const group = CATALOG_GROUPS.find((g) => g.key === type);
    if (group) {
      where.type = { in: [...group.types] };
    } else {
      where.type = type;
    }
  }
  if (search) {
    where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { description: { contains: search, mode: "insensitive" } },
      { fileFormat: { contains: search, mode: "insensitive" } },
    ];
  }

  const products = (await prisma.product.findMany({
    where,
    orderBy: { createdAt: "desc" },
  })) as any[];

  const productTypes = [
    { label: "Tất Cả", value: "ALL", icon: Layers },
    ...CATALOG_GROUPS.map((g) => ({
      label: g.label,
      value: g.key,
      icon:
        g.key === "ARCHITECTURE"
          ? Building2
          : g.key === "INTERIOR"
          ? Layout
          : g.key === "CONSTRUCTION"
          ? HardHat
          : FileCode,
    })),
  ];

  return (
    <div className="pt-28 pb-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
      {/* Header */}
      <div className="space-y-3">
        <span className="text-xs text-thuy-400 uppercase tracking-widest font-semibold block">
          Kho Tài Nguyên Kiến Trúc
        </span>
        <h1 className="font-display font-bold text-3xl sm:text-5xl text-white">
          Thư Viện CAD, Model 3D & Bản Vẽ Chuẩn
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 max-w-2xl font-light">
          Cung cấp trọn bộ hồ sơ kỹ thuật thi công, mô hình 3D vật liệu PBR 4K và template trình chiếu
          được thiết kế chuẩn mực bởi ACD Studio.
        </p>
      </div>

      {/* Filter Chips & Search Bar */}
      <div className="p-4 rounded-2xl bg-thuy-850/80 border border-thuy-750 backdrop-blur-md space-y-4">
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
          {/* Type Chips */}
          <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
            {productTypes.map((pt) => {
              const isActive = (type || "ALL") === pt.value;
              const Icon = pt.icon;
              return (
                <Link
                  key={pt.value}
                  href={`/products?type=${pt.value}`}
                  className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                    isActive
                      ? "bg-thuy-400 text-thuy-950 shadow-glow-cyan"
                      : "bg-thuy-900 text-slate-400 hover:text-white border border-thuy-700"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{pt.label}</span>
                </Link>
              );
            })}
          </div>

          {/* Search Input */}
          <form method="GET" className="relative w-full sm:w-72">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              name="search"
              defaultValue={search || ""}
              placeholder="Tìm CAD, 3D model..."
              className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-thuy-900 border border-thuy-700 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-thuy-400"
            />
          </form>
        </div>
      </div>

      {/* Products Grid */}
      <div className="space-y-6">
        <div className="flex items-center justify-between text-xs text-slate-400">
          <span>
            Tìm thấy <b className="text-thuy-400 font-semibold">{products.length}</b> sản phẩm
          </span>
        </div>

        {products.length === 0 ? (
          <div className="text-center py-20 rounded-2xl bg-thuy-850/40 border border-thuy-800 space-y-3">
            <p className="text-slate-400 text-sm">Không tìm thấy tài nguyên phù hợp.</p>
            <Link
              href="/products"
              className="inline-block px-4 py-2 rounded-lg bg-thuy-400 text-thuy-950 font-semibold text-xs"
            >
              Xem tất cả tài nguyên
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.map((prod) => (
              <div
                key={prod.id}
                className="group flex flex-col justify-between rounded-2xl bg-thuy-850/70 border border-thuy-750 p-4 hover:border-thuy-400 transition-all duration-300 hover:shadow-card-dark"
              >
                <div className="space-y-3">
                  <div className="relative aspect-[4/3] rounded-xl overflow-hidden bg-thuy-950">
                    {prod.thumbnail ? (
                      <Image
                        src={prod.thumbnail}
                        alt={prod.name}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                        unoptimized
                      />
                    ) : (
                      <div className="w-full h-full bg-thuy-800 flex items-center justify-center text-slate-500">
                        <Download className="w-6 h-6" />
                      </div>
                    )}
                    <span className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded bg-thuy-950/85 backdrop-blur-sm border border-thuy-700 text-[10px] font-bold text-thuy-300">
                        {prod.productCategory || "Tài nguyên"}
                    </span>
                    {prod.fileSize && (
                      <span className="absolute bottom-2.5 right-2.5 px-2 py-0.5 rounded bg-thuy-950/85 text-[10px] text-slate-300 border border-thuy-700">
                        {prod.fileSize}
                      </span>
                    )}
                  </div>

                  <div>
                    <h3 className="font-semibold text-sm text-white line-clamp-2 leading-snug group-hover:text-thuy-300 transition-colors">
                      {prod.name}
                    </h3>
                    <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">
                      {prod.fileFormat || prod.description}
                    </p>
                  </div>
                </div>

                <div className="pt-4 mt-4 border-t border-thuy-800 flex items-center justify-between">
                  <div>
                    <span className="font-bold text-base text-thuy-400">
                      {formatVND(prod.price ?? 0)}
                    </span>
                  </div>

                  <Link
                    href={`/products/${prod.slug}`}
                    className="px-3.5 py-1.5 rounded-lg bg-thuy-800 hover:bg-thuy-400 hover:text-thuy-950 text-slate-200 text-xs font-semibold transition-all flex items-center gap-1"
                  >
                    <span>Xem file</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}


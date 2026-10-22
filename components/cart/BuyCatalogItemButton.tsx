"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useCartStore } from "@/lib/cart";
import { useCurrentUser } from "@/components/auth/useCurrentUser";
import { formatVND } from "@/lib/utils";
import { ShoppingBag, Check, Lock, LogIn } from "lucide-react";

interface Props {
  item: {
    id: string;
    name: string;
    slug: string;
    price: number;
    type?: string;
    fileFormat?: string | null;
    fileSize?: string | null;
    thumbnail?: string | null;
  };
  variant?: "full" | "compact";
}

/**
 * Nút mua hồ sơ (file kỹ thuật) gắn với dự án.
 * Chỉ khách đã đăng nhập mới thêm vào giỏ được.
 */
export default function BuyCatalogItemButton({ item, variant = "full" }: Props) {
  const router = useRouter();
  const { addItem } = useCartStore();
  const { user, loading } = useCurrentUser();
  const [added, setAdded] = useState(false);

  const isLoggedIn = Boolean(user);

  const handleBuy = () => {
    if (!isLoggedIn) {
      router.push(`/login?from=${encodeURIComponent("/projects")}`);
      return;
    }
    addItem({
      id: item.id,
      name: item.name,
      slug: item.slug,
      price: item.price,
      type: item.type || "ARCHITECTURE",
      fileFormat: item.fileFormat ?? null,
      fileSize: item.fileSize ?? null,
      thumbnail: item.thumbnail ?? null,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 3000);
  };

  if (variant === "compact") {
    return (
      <button
        onClick={handleBuy}
        disabled={loading}
        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-thuy-400 text-thuy-950 font-bold text-xs uppercase tracking-wider hover:brightness-110 shadow-glow-cyan transition-all"
      >
        {added ? <Check className="w-4 h-4" /> : <ShoppingBag className="w-4 h-4" />}
        <span>{added ? "Đã thêm vào giỏ ✓" : `Mua hồ sơ · ${formatVND(item.price)}`}</span>
      </button>
    );
  }

  return (
    <div className="p-6 rounded-2xl bg-thuy-850/80 border border-thuy-750 space-y-4">
      <div className="flex items-center gap-2 text-thuy-300 text-xs font-semibold uppercase tracking-wider">
        <ShoppingBag className="w-4 h-4" />
        Hồ sơ kỹ thuật của dự án
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="font-display font-bold text-2xl text-thuy-400 text-glow">
            {formatVND(item.price)}
          </span>
          <p className="text-xs text-slate-400 mt-1 max-w-md">{item.name}</p>
          {(item.fileFormat || item.fileSize) && (
            <p className="text-[11px] text-slate-500 mt-1">
              {item.fileFormat}
              {item.fileFormat && item.fileSize ? " · " : ""}
              {item.fileSize}
            </p>
          )}
        </div>

        <button
          onClick={handleBuy}
          disabled={loading}
          className="py-3 px-6 rounded-xl font-bold text-xs uppercase tracking-wider text-thuy-950 bg-gradient-to-r from-thuy-400 to-aqua-400 hover:brightness-110 shadow-glow-cyan transition-all flex items-center justify-center gap-2"
        >
          {added ? (
            <>
              <Check className="w-4 h-4" /> Đã thêm vào giỏ
            </>
          ) : isLoggedIn ? (
            <>
              <ShoppingBag className="w-4 h-4" /> Mua & Tải Về
            </>
          ) : (
            <>
              <LogIn className="w-4 h-4" /> Đăng nhập để mua
            </>
          )}
        </button>
      </div>

      <p className="text-[11px] text-slate-500 flex items-start gap-1.5">
        <Lock className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
        Sau khi thanh toán, link tải xuất hiện trong vòng 5 phút và chỉ tài khoản đã thanh toán
        mới tải được.
      </p>
    </div>
  );
}

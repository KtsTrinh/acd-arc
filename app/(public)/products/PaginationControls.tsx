"use client";

import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

export default function ProductsPagination({
  pageNum,
  pageSize,
  total,
  productGroup,
  productCategory,
  search,
  featured,
}: {
  pageNum: number;
  pageSize: number;
  total: number;
  productGroup?: string;
  productCategory?: string;
  search?: string;
  featured?: string;
}) {
  const router = useRouter();
  const sp = useSearchParams();

  const buildUrl = (page: number, size: number) => {
    const params = new URLSearchParams(sp.toString());
    params.set("page", String(page));
    params.set("size", String(size));
    return `/products?${params.toString()}`;
  };

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return (
    <div className="flex items-center justify-center gap-2 mt-6 flex-wrap">
      <div className="flex items-center gap-2 text-xs text-slate-400">
        <span>Hiển thị</span>
        <select
          value={pageSize}
          onChange={(e) => router.push(buildUrl(1, Number(e.target.value)))}
          className="bg-thuy-900 border border-thuy-700 rounded px-2 py-1 text-white"
        >
          <option value={12}>12</option>
          <option value={24}>24</option>
          <option value={36}>36</option>
        </select>
        <span>/ trang</span>
      </div>
      <div className="flex items-center gap-1">
        {pageNum > 1 && (
          <>
            <Link href={buildUrl(1, pageSize)} className="px-2 py-1 rounded bg-thuy-800 text-white text-xs">{`<<`}</Link>
            <Link href={buildUrl(pageNum - 1, pageSize)} className="px-2 py-1 rounded bg-thuy-800 text-white text-xs">{`<`}</Link>
          </>
        )}
        <span className="px-2 text-xs text-slate-400">{pageNum} / {totalPages}</span>
        {pageNum < totalPages && (
          <>
            <Link href={buildUrl(pageNum + 1, pageSize)} className="px-2 py-1 rounded bg-thuy-800 text-white text-xs">{`>`}</Link>
            <Link href={buildUrl(totalPages, pageSize)} className="px-2 py-1 rounded bg-thuy-800 text-white text-xs">{`>>`}</Link>
          </>
        )}
      </div>
    </div>
  );
}

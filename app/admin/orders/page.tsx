"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { formatVND, formatDateTime } from "@/lib/utils";
import {
  ShoppingBag,
  CheckCircle2,
  Clock,
  Download,
  ShieldCheck,
  RefreshCw,
  ExternalLink,
  Search,
  Filter,
  Trash2,
} from "lucide-react";

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [search, setSearch] = useState("");
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const fetchOrders = async () => {
    try {
      const params = new URLSearchParams();
      if (statusFilter !== "ALL") params.set("status", statusFilter);
      if (search) params.set("search", search);

      const res = await fetch(`/api/orders?${params.toString()}`);
      const data = await res.json();
      if (data.orders) setOrders(data.orders);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [statusFilter, search]);

  const handleUpdateStatus = async (orderId: string, newStatus: string) => {
    setUpdatingId(orderId);
    try {
      const res = await fetch(`/api/orders/${orderId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (data.order) {
        fetchOrders();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleRegenerateLinks = async (orderId: string) => {
    setUpdatingId(orderId);
    try {
      const res = await fetch(`/api/orders/${orderId}/status`, { method: "POST" });
      const data = await res.json();
      if (data.success) {
        fetchOrders();
      } else {
        alert(data.error || "Không cấp lại được link tải.");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDeleteOrder = async (orderId: string, orderNumber: string) => {
    if (
      !confirm(
        `Xoá đơn hàng #${orderNumber}? Toàn bộ link tải của đơn này cũng sẽ bị xoá.`
      )
    )
      return;
    setUpdatingId(orderId);
    try {
      const res = await fetch(`/api/orders/${orderId}/status`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        fetchOrders();
      } else {
        alert(data.error || "Không xoá được đơn hàng.");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display font-bold text-2xl sm:text-3xl text-[#142338]">
            Quản Lý Đơn Hàng & Cấp Tải
          </h1>
          <p className="text-xs text-[#526780]">
            Theo dõi trạng thái thanh toán, tự động sinh mã Token tải file bảo mật cho đúng tài
            khoản đã thanh toán (mặc định hiệu lực 5 phút, tối đa 5 lượt tải)
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-white border border-[#E1EAF2] flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="flex items-center gap-2">
          {["ALL", "PAID", "PENDING", "CANCELLED"].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                statusFilter === st
                  ? "bg-white400 text-thuy-950 shadow-glow-cyan"
                  : "bg-white900 text-slate-600 hover:text-[#142338] border border-slate-200750"
              }`}
            >
              {st === "ALL" ? "Tất Cả" : st}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-600" />
          <input
            type="text"
            placeholder="Tìm theo mã đơn, email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-xl bg-white900 border border-slate-200700 text-xs text-[#142338] placeholder-slate-400 focus:outline-none focus:border-slate-200400"
          />
        </div>
      </div>

      {/* Orders Table */}
      <div className="rounded-2xl bg-white850 border border-slate-200750 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-white900/80 text-slate-600 uppercase font-semibold text-[10px] tracking-wider border-b border-slate-200750">
              <tr>
                <th className="py-3 px-5">Mã Đơn Hàng</th>
                <th className="py-3 px-5">Khách Hàng & Liên Hệ</th>
                <th className="py-3 px-5">Sản Phẩm Trong Đơn</th>
                <th className="py-3 px-5">Tổng Tiền</th>
                <th className="py-3 px-5">Trạng Thái</th>
                <th className="py-3 px-5">Liên Kết Tải (Token)</th>
                <th className="py-3 px-5 text-right">Thao Tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-thuy-750/60">
              {orders.map((o) => (
                <tr key={o.id} className="hover:bg-white800/40">
                  <td className="py-4 px-5">
                    <span className="font-mono font-bold text-[#142338] text-sm block">
                      #{o.orderNumber}
                    </span>
                    <span className="text-[10px] text-slate-600">
                      {formatDateTime(o.createdAt)}
                    </span>
                  </td>

                  <td className="py-4 px-5">
                    <p className="font-bold text-[#142338]">{o.customerName}</p>
                    <p className="text-[10px] text-thuy-300 font-mono">{o.customerEmail}</p>
                    {o.customerPhone && (
                      <p className="text-[10px] text-slate-600">{o.customerPhone}</p>
                    )}
                  </td>

                  <td className="py-4 px-5 max-w-xs">
                    <div className="space-y-1">
                      {o.items.map((it: any) => (
                        <div key={it.id} className="text-[11px] text-slate-700 truncate">
                          • {it.productName || it.product?.name}
                        </div>
                      ))}
                    </div>
                  </td>

                  <td className="py-4 px-5 font-bold text-thuy-400 text-sm">
                    {formatVND(o.total)}
                  </td>

                  <td className="py-4 px-5">
                    <select
                      value={o.status}
                      disabled={updatingId === o.id}
                      onChange={(e) => handleUpdateStatus(o.id, e.target.value)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold border cursor-pointer focus:outline-none ${
                        o.status === "PAID"
                          ? "bg-emerald-950 text-emerald-400 border-emerald-700"
                          : o.status === "PENDING"
                          ? "bg-amber-950 text-amber-400 border-amber-700"
                          : "bg-red-950 text-red-400 border-red-700"
                      }`}
                    >
                      <option value="PAID">PAID (Đã thanh toán)</option>
                      <option value="PENDING">PENDING (Chờ duyệt)</option>
                      <option value="CANCELLED">CANCELLED (Hủy)</option>
                    </select>
                  </td>

                  <td className="py-4 px-5">
                    {o.downloads && o.downloads.length > 0 ? (
                      <div className="space-y-1">
                        <span className="text-emerald-400 font-bold text-[11px] block">
                          ✓ {o.downloads.length} Token Tải Đang Active
                        </span>
                        {o.downloads.map((d: any) => (
                          <div key={d.id} className="text-[10px] text-slate-600 font-mono">
                            Đã tải: {d.downloadCount}/{d.maxDownloads} lần
                          </div>
                        ))}
                      </div>
                    ) : (
                      <span className="text-slate-500 text-[11px]">Chưa cấp quyền</span>
                    )}
                  </td>

                  <td className="py-4 px-5 text-right">
                    <div className="inline-flex items-center gap-1.5">
                      {o.status === "PAID" && (
                        <button
                          onClick={() => handleRegenerateLinks(o.id)}
                          disabled={updatingId === o.id}
                          className="p-2 rounded-lg bg-white800 hover:bg-white700 text-thuy-300 inline-flex items-center gap-1 text-xs disabled:opacity-50"
                          title="Cấp lại link tải mới cho khách"
                        >
                          <RefreshCw
                            className={`w-3.5 h-3.5 ${
                              updatingId === o.id ? "animate-spin" : ""
                            }`}
                          />
                          <span>Cấp lại link</span>
                        </button>
                      )}
                      <Link
                        href={`/orders/${o.id}`}
                        target="_blank"
                        className="p-2 rounded-lg bg-white800 hover:bg-white700 text-slate-200 inline-flex items-center gap-1 text-xs"
                        title="Xem trang nhận file khách hàng"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>Xem</span>
                      </Link>
                      <button
                        onClick={() => handleDeleteOrder(o.id, o.orderNumber)}
                        disabled={updatingId === o.id}
                        className="p-2 rounded-lg bg-white800 hover:bg-red-950 hover:text-red-400 text-slate-600 inline-flex items-center gap-1 text-xs disabled:opacity-50"
                        title="Xoá đơn hàng"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}


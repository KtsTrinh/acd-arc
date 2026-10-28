"use client";

import React, { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  Users,
  Eye,
  Activity,
  Clock,
  ShoppingCart,
  ShoppingBag,
  RefreshCw,
  Search,
  TrendingUp,
  LayoutList,
} from "lucide-react";
import { formatVND, formatDateTime } from "@/lib/utils";
import { formatDuration } from "@/lib/tracking";

const TABS = [
  { id: "traffic", label: "Truy Cập", icon: Activity },
  { id: "customers", label: "Khách Hàng", icon: Users },
  { id: "orders", label: "Đơn Hàng", icon: ShoppingBag },
  { id: "cart", label: "Giỏ Hàng", icon: ShoppingCart },
];

const RANGES = [
  { id: "today", label: "Hôm Nay" },
  { id: "7d", label: "7 Ngày" },
  { id: "30d", label: "30 Ngày" },
  { id: "all", label: "Tất Cả" },
];

const DEVICE_BADGE: Record<string, string> = {
  Mobile: "bg-aqua-500/20 text-aqua-400 border border-aqua-500/30",
  Tablet: "bg-amber-500/20 text-amber-400 border border-amber-500/30",
  Desktop: "bg-thuy-500/20 text-thuy-300 border border-thuy-500/40",
};

export default function AdminCustomersPage() {
  const [tab, setTab] = useState("all");
  const [range, setRange] = useState("7d");
  const [search, setSearch] = useState("");
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [pageSize, setPageSize] = useState(20);
  const [page, setPage] = useState(1);

  const fetchAnalytics = useCallback(
    async (silent = false) => {
      if (!silent) setRefreshing(true);

      try {
        const params = new URLSearchParams();
        params.set("range", range);
        if (search) params.set("search", search);

        const res = await fetch(`/api/admin/analytics?${params.toString()}`);
        const json = await res.json();
        if (json.error) {
          console.error(json.error);
          return;
        }
        setData(json);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [range, search],
  );

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  // Làm mới số khách đang truy cập mỗi 30 giây
  useEffect(() => {
    const timer = setInterval(() => fetchAnalytics(true), 30000);
    return () => clearInterval(timer);
  }, [fetchAnalytics]);

  const stats = data?.stats;
  const live = data?.live || [];
  const sessions = data?.sessions || [];
  const customers = data?.customers || [];
  const buyers = data?.buyers || [];
  const cartTop = data?.cartTop || [];
  const cartRecent = data?.cartRecent || [];
  const topPages = data?.topPages || [];

  const statCards = [
    {
      label: "Đang Truy Cập",
      value: stats ? `${stats.liveVisitors} khách` : "-",
      icon: Activity,
      sub: "Hoạt động trong 5 phút qua",
      color: "text-emerald-400",
    },
    {
      label: "Lượt Xem Hôm Nay",
      value: stats?.todayViews ?? "-",
      icon: Eye,
      sub: `${stats?.todayVisitors ?? 0} phiên truy cập mới`,
      color: "text-aqua-400",
    },
    {
      label: "Khách Đã Truy Cập",
      value: stats?.totalVisitors ?? "-",
      icon: Users,
      sub: `${stats?.totalViews ?? 0} lượt xem tổng`,
      color: "text-thuy-400",
    },
    {
      label: "Thời Gian Truy Cập TB",
      value: stats ? formatDuration(stats.avgDurationSec) : "-",
      icon: Clock,
      sub: "Trung bình mỗi phiên",
      color: "text-amber-400",
    },
    {
      label: "Khách Hàng Đã Đăng Ký",
      value: stats?.registeredCustomers ?? "-",
      icon: Users,
      sub: `${stats?.orders ?? 0} đơn hàng phát sinh`,
      color: "text-violet-400",
    },
    {
      label: "Lượt Thêm Vào Giỏ",
      value: stats?.cartAdds ?? "-",
      icon: ShoppingCart,
      sub: `Tỷ lệ chuyển đổi ${stats?.conversionRate ?? 0}%`,
      color: "text-rose-400",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display font-bold text-2xl sm:text-3xl text-white">
            Khách Hàng &amp; Truy Cập
          </h1>
          <p className="text-xs text-slate-400">
            Theo dõi khách đang truy cập, lịch sử truy cập, đơn hàng và hành vi
            thêm vào giỏ
          </p>
        </div>

        <button
          onClick={() => fetchAnalytics()}
          disabled={refreshing}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-thuy-800 text-slate-200 hover:text-white hover:bg-thuy-750 border border-thuy-700 text-xs font-semibold transition-all self-start sm:self-auto"
        >
          <RefreshCw
            className={`w-3.5 h-3.5 ${refreshing ? "animate-spin" : ""}`}
          />
          <span>Làm Mới</span>
        </button>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {statCards.map((s) => {
          const Icon = s.icon;
          return (
            <div
              key={s.label}
              className="p-4 rounded-2xl bg-thuy-850/90 border border-thuy-750 flex flex-col justify-between space-y-3"
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-medium text-slate-400">
                  {s.label}
                </span>
                <div className="p-1.5 rounded-lg bg-thuy-900 border border-thuy-700">
                  <Icon className={`w-3.5 h-3.5 ${s.color}`} />
                </div>
              </div>
              <div>
                <span className="font-display font-extrabold text-xl text-white block">
                  {s.value}
                </span>
                <span className="text-[10px] text-slate-400 mt-0.5 block">
                  {s.sub}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap items-center gap-1 p-1 rounded-2xl bg-thuy-850 border border-thuy-750 w-fit">
        {TABS.map((t) => {
          const Icon = t.icon;
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
                tab === t.id
                  ? "bg-thuy-400 text-thuy-950 shadow-glow-cyan"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{t.label}</span>
            </button>
          );
        })}
      </div>

      {loading ? (
        <div className="py-16 text-center text-slate-400 text-xs">
          Đang tải dữ liệu khách hàng...
        </div>
      ) : (
        <>
          {/* ---------------- TAB: TRUY CẬP ---------------- */}
          {tab === "traffic" && (
            <div className="space-y-6">
              {/* Khách đang truy cập */}
              <div className="rounded-2xl bg-thuy-850 border border-thuy-750 overflow-hidden shadow-xl">
                <div className="p-5 border-b border-thuy-750 flex items-center justify-between">
                  <div>
                    <h2 className="font-semibold text-base text-white flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                      Khách Đang Truy Cập
                    </h2>
                    <p className="text-xs text-slate-400">
                      Cập nhật tự động mỗi 30 giây
                    </p>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold">
                    {live.length} ONLINE
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-thuy-900/80 text-slate-400 uppercase font-semibold text-[10px] tracking-wider border-b border-thuy-750">
                      <tr>
                        <th className="py-3 px-5">Khách</th>
                        <th className="py-3 px-5">Đang Xem</th>
                        <th className="py-3 px-5">Thiết Bị</th>
                        <th className="py-3 px-5">IP</th>
                        <th className="py-3 px-5">Thời Gian</th>
                        <th className="py-3 px-5">Hoạt Động Cuối</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-thuy-750/60">
                      {live.length === 0 && (
                        <tr>
                          <td
                            colSpan={6}
                            className="py-10 text-center text-slate-500"
                          >
                            Hiện chưa có khách nào đang truy cập
                          </td>
                        </tr>
                      )}
                      {live.map((s: any) => (
                        <tr key={s.id} className="hover:bg-thuy-800/40">
                          <td className="py-3.5 px-5">
                            {s.user ? (
                              <>
                                <p className="font-bold text-white">
                                  {s.user.name || "Khách hàng"}
                                </p>
                                <p className="text-[10px] text-thuy-300 font-mono">
                                  {s.user.email}
                                </p>
                              </>
                            ) : (
                              <>
                                <p className="font-bold text-slate-300">
                                  Khách ẩn danh
                                </p>
                                <p className="text-[10px] text-slate-500 font-mono">
                                  {s.visitorId.slice(0, 8)}
                                </p>
                              </>
                            )}
                          </td>
                          <td className="py-3.5 px-5 font-mono text-[11px] text-thuy-300">
                            {s.lastPath || "/"}
                          </td>
                          <td className="py-3.5 px-5">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                DEVICE_BADGE[s.device] ||
                                "bg-slate-800 text-slate-300 border border-slate-700"
                              }`}
                            >
                              {s.device || "Khác"}
                            </span>
                            <span className="block text-[10px] text-slate-500 mt-0.5">
                              {s.browser} · {s.os}
                            </span>
                          </td>
                          <td className="py-3.5 px-5 font-mono text-[11px] text-slate-400">
                            {s.ip || "unknown"}
                          </td>
                          <td className="py-3.5 px-5 text-slate-300">
                            {formatDuration(s.durationSec)}
                            <span className="block text-[10px] text-slate-500">
                              {s.pageViews} lượt xem
                            </span>
                          </td>
                          <td className="py-3.5 px-5 text-slate-400 text-[11px]">
                            {formatDateTime(s.lastSeenAt)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Bộ lọc + lịch sử truy cập */}
              <div className="p-4 rounded-2xl bg-thuy-850 border border-thuy-750 flex flex-col sm:flex-row gap-4 items-center justify-between">
                <div className="flex items-center gap-2">
                  {RANGES.map((r) => (
                    <button
                      key={r.id}
                      onClick={() => setRange(r.id)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                        range === r.id
                          ? "bg-thuy-400 text-thuy-950 shadow-glow-cyan"
                          : "bg-thuy-900 text-slate-400 hover:text-white border border-thuy-750"
                      }`}
                    >
                      {r.label}
                    </button>
                  ))}
                </div>

                <div className="relative w-full sm:w-72">
                  <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Tìm email, tên, IP, đường dẫn..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 rounded-xl bg-thuy-900 border border-thuy-700 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-thuy-400"
                  />
                </div>
              </div>

              {/* Lịch sử truy cập */}
              <div className="rounded-2xl bg-thuy-850 border border-thuy-750 overflow-hidden shadow-xl">
                <div className="p-5 border-b border-thuy-750">
                  <h2 className="font-semibold text-base text-white flex items-center gap-2">
                    <LayoutList className="w-4 h-4 text-thuy-400" />
                    Lịch Sử Truy Cập
                  </h2>
                  <p className="text-xs text-slate-400">
                    Mỗi phiên ghi lại thiết bị, đường dẫn, IP và tổng thời gian
                    ở lại website
                  </p>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-thuy-900/80 text-slate-400 uppercase font-semibold text-[10px] tracking-wider border-b border-thuy-750">
                      <tr>
                        <th className="py-3 px-5">Khách</th>
                        <th className="py-3 px-5">Lượt Xem</th>
                        <th className="py-3 px-5">Thời Gian</th>
                        <th className="py-3 px-5">Thiết Bị</th>
                        <th className="py-3 px-5">Trang Đầu / Gần Nhất</th>
                        <th className="py-3 px-5">Bắt Đầu</th>
                        <th className="py-3 px-5">Hoạt Động Cuối</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-thuy-750/60">
                      {sessions.length === 0 && (
                        <tr>
                          <td
                            colSpan={7}
                            className="py-10 text-center text-slate-500"
                          >
                            Chưa có dữ liệu truy cập trong khoảng thời gian này
                          </td>
                        </tr>
                      )}
                      {sessions.map((s: any) => (
                        <tr key={s.id} className="hover:bg-thuy-800/40">
                          <td className="py-3.5 px-5">
                            {s.user ? (
                              <>
                                <p className="font-bold text-white">
                                  {s.user.name || "Khách hàng"}
                                </p>
                                <p className="text-[10px] text-thuy-300 font-mono">
                                  {s.user.email}
                                </p>
                              </>
                            ) : (
                              <>
                                <p className="font-bold text-slate-300">
                                  Khách ẩn danh
                                </p>
                                <p className="text-[10px] text-slate-500 font-mono">
                                  {s.visitorId.slice(0, 8)}
                                </p>
                              </>
                            )}
                          </td>
                          <td className="py-3.5 px-5 font-bold text-thuy-400">
                            {s.pageViews}
                          </td>
                          <td className="py-3.5 px-5 text-slate-300">
                            {formatDuration(s.durationSec)}
                          </td>
                          <td className="py-3.5 px-5">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                DEVICE_BADGE[s.device] ||
                                "bg-slate-800 text-slate-300 border border-slate-700"
                              }`}
                            >
                              {s.device || "Khác"}
                            </span>
                            <span className="block text-[10px] text-slate-500 mt-0.5">
                              {s.browser} · {s.os}
                            </span>
                          </td>
                          <td className="py-3.5 px-5 font-mono text-[10px] text-slate-400 max-w-[220px]">
                            <p className="truncate">{s.landingPath || "/"}</p>
                            <p className="truncate text-thuy-400">
                              {s.lastPath}
                            </p>
                          </td>
                          <td className="py-3.5 px-5 text-slate-400 text-[11px]">
                            {formatDateTime(s.firstSeenAt)}
                          </td>
                          <td className="py-3.5 px-5 text-slate-400 text-[11px]">
                            {formatDateTime(s.lastSeenAt)}
                            {s.isLive && (
                              <span className="ml-1.5 inline-block w-1.5 h-1.5 rounded-full bg-emerald-400" />
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Trang được xem nhiều */}
              <div className="rounded-2xl bg-thuy-850 border border-thuy-750 overflow-hidden shadow-xl">
                <div className="p-5 border-b border-thuy-750">
                  <h2 className="font-semibold text-base text-white flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-thuy-400" />
                    Trang Được Xem Nhiều
                  </h2>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-thuy-900/80 text-slate-400 uppercase font-semibold text-[10px] tracking-wider border-b border-thuy-750">
                      <tr>
                        <th className="py-3 px-5">Đường Dẫn</th>
                        <th className="py-3 px-5">Lượt Xem</th>
                        <th className="py-3 px-5">Thời Gian Ở Lại TB</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-thuy-750/60">
                      {topPages.length === 0 && (
                        <tr>
                          <td
                            colSpan={3}
                            className="py-10 text-center text-slate-500"
                          >
                            Chưa có dữ liệu
                          </td>
                        </tr>
                      )}
                      {topPages.map((p: any) => (
                        <tr key={p.path} className="hover:bg-thuy-800/40">
                          <td className="py-3 px-5 font-mono text-[11px] text-thuy-300">
                            {p.path}
                          </td>
                          <td className="py-3 px-5 font-bold text-white">
                            {p.views}
                          </td>
                          <td className="py-3 px-5 text-slate-300">
                            {formatDuration(p.avgDurationSec)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ---------------- TAB: KHÁCH HÀNG ---------------- */}
          {tab === "customers" && (
            <div className="rounded-2xl bg-thuy-850 border border-thuy-750 overflow-hidden shadow-xl">
              <div className="p-5 border-b border-thuy-750 flex items-center justify-between">
                <div>
                  <h2 className="font-semibold text-base text-white">
                    Thông Tin Từng Khách Hàng
                  </h2>
                  <p className="text-xs text-slate-400">
                    Hồ sơ khách đã đăng ký kèm lượt truy cập, thời gian ở lại
                    website và lịch sử mua hàng
                  </p>
                </div>
                <span className="px-2.5 py-0.5 rounded-full bg-thuy-500/20 text-thuy-300 border border-thuy-500/40 text-[10px] font-bold">
                  {customers.length} KHÁCH
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-thuy-900/80 text-slate-400 uppercase font-semibold text-[10px] tracking-wider border-b border-thuy-750">
                    <tr>
                      <th className="py-3 px-5">Khách Hàng</th>
                      <th className="py-3 px-5">Liên Hệ</th>
                      <th className="py-3 px-5">Nguồn</th>
                      <th className="py-3 px-5">Truy Cập</th>
                      <th className="py-3 px-5">Thời Gian</th>
                      <th className="py-3 px-5">Đơn Hàng</th>
                      <th className="py-3 px-5">Tổng Chi Tiêu</th>
                      <th className="py-3 px-5">Thêm Giỏ</th>
                      <th className="py-3 px-5">Lần Cuối</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-thuy-750/60">
                    {customers.length === 0 && (
                      <tr>
                        <td
                          colSpan={9}
                          className="py-10 text-center text-slate-500"
                        >
                          Chưa có khách hàng
                        </td>
                      </tr>
                    )}
                    {customers.map((c: any) => (
                      <tr key={c.id} className="hover:bg-thuy-800/40">
                        <td className="py-3.5 px-5">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-lg bg-thuy-800 flex items-center justify-center text-[10px] font-bold text-thuy-300 overflow-hidden">
                              {c.avatar ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img
                                  src={c.avatar}
                                  alt={c.name || "avatar"}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                (c.name || "K").charAt(0).toUpperCase()
                              )}
                            </div>
                            <div>
                              <p className="font-bold text-white">
                                {c.name || "Chưa đặt tên"}
                              </p>
                              <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-thuy-500/20 text-thuy-300 border border-thuy-500/40">
                                {c.role}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="py-3.5 px-5">
                          <p className="text-[11px] text-thuy-300 font-mono">
                            {c.email || "-"}
                          </p>
                          <p className="text-[10px] text-slate-400">
                            {c.phone || "-"}
                          </p>
                          {c.address && (
                            <p className="text-[10px] text-slate-500">
                              {c.address}
                            </p>
                          )}
                        </td>
                        <td className="py-3.5 px-5 text-slate-300 capitalize">
                          {c.provider || "local"}
                        </td>
                        <td className="py-3.5 px-5">
                          <span className="font-bold text-white">
                            {c.visits}
                          </span>
                          <span className="block text-[10px] text-slate-500">
                            {c.pageViews} lượt xem
                          </span>
                        </td>
                        <td className="py-3.5 px-5 text-slate-300">
                          {formatDuration(c.durationSec)}
                        </td>
                        <td className="py-3.5 px-5">
                          <span className="font-bold text-white">
                            {c.orderCount}
                          </span>
                          <span className="block text-[10px] text-slate-500">
                            {c.paidCount} đã thanh toán
                          </span>
                        </td>
                        <td className="py-3.5 px-5 font-bold text-thuy-400">
                          {formatVND(c.totalSpent)}
                        </td>
                        <td className="py-3.5 px-5 text-slate-300">
                          {c.cartAdds} lượt
                        </td>
                        <td className="py-3.5 px-5 text-slate-400 text-[11px]">
                          {c.lastVisitAt
                            ? formatDateTime(c.lastVisitAt)
                            : c.lastOrderAt
                              ? formatDateTime(c.lastOrderAt)
                              : "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ---------------- TAB: ĐƠN HÀNG ---------------- */}
          {tab === "orders" && (
            <div className="rounded-2xl bg-thuy-850 border border-thuy-750 overflow-hidden shadow-xl">
              <div className="p-5 border-b border-thuy-750 flex items-center justify-between">
                <div>
                  <h2 className="font-semibold text-base text-white">
                    Đơn Hàng Khách Từng Mua
                  </h2>
                  <p className="text-xs text-slate-400">
                    Tổng hợp theo từng khách: số đơn, tổng chi tiêu và sản phẩm
                    đã mua
                  </p>
                </div>
                <Link
                  href="/admin/orders"
                  className="px-2.5 py-0.5 rounded-full bg-thuy-800 text-thuy-300 border border-thuy-700 text-[10px] font-bold hover:text-white transition-colors"
                >
                  XEM TẤT CẢ ĐƠN
                </Link>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-thuy-900/80 text-slate-400 uppercase font-semibold text-[10px] tracking-wider border-b border-thuy-750">
                    <tr>
                      <th className="py-3 px-5">Khách Hàng</th>
                      <th className="py-3 px-5">Số Đơn</th>
                      <th className="py-3 px-5">Tổng Chi Tiêu</th>
                      <th className="py-3 px-5">Sản Phẩm Đã Mua</th>
                      <th className="py-3 px-5">Mua Lần Cuối</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-thuy-750/60">
                    {buyers.length === 0 && (
                      <tr>
                        <td
                          colSpan={5}
                          className="py-10 text-center text-slate-500"
                        >
                          Chưa có đơn hàng nào
                        </td>
                      </tr>
                    )}
                    {buyers.map((b: any, idx: number) => (
                      <tr key={idx} className="hover:bg-thuy-800/40">
                        <td className="py-3.5 px-5">
                          <p className="font-bold text-white">{b.name}</p>
                          <p className="text-[10px] text-thuy-300 font-mono">
                            {b.email}
                          </p>
                          {b.phone && (
                            <p className="text-[10px] text-slate-500">
                              {b.phone}
                            </p>
                          )}
                        </td>
                        <td className="py-3.5 px-5">
                          <span className="font-bold text-white">
                            {b.orderCount}
                          </span>
                          <span className="block text-[10px] text-slate-500">
                            {b.paidCount} đã thanh toán
                          </span>
                        </td>
                        <td className="py-3.5 px-5 font-bold text-thuy-400">
                          {formatVND(b.totalSpent)}
                        </td>
                        <td className="py-3.5 px-5 max-w-xs">
                          <div className="space-y-0.5">
                            {b.items.slice(0, 4).map((item: any, i: number) => (
                              <p
                                key={i}
                                className="text-[11px] text-slate-300 truncate"
                              >
                                • {item.name} x{item.quantity}
                              </p>
                            ))}
                            {b.items.length > 4 && (
                              <p className="text-[10px] text-slate-500">
                                +{b.items.length - 4} sản phẩm khác
                              </p>
                            )}
                          </div>
                        </td>
                        <td className="py-3.5 px-5 text-slate-400 text-[11px]">
                          {formatDateTime(b.lastOrderAt)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ---------------- TAB: GIỎ HÀNG ---------------- */}
          {tab === "cart" && (
            <div className="space-y-6">
              <div className="rounded-2xl bg-thuy-850 border border-thuy-750 overflow-hidden shadow-xl">
                <div className="p-5 border-b border-thuy-750">
                  <h2 className="font-semibold text-base text-white flex items-center gap-2">
                    <ShoppingCart className="w-4 h-4 text-thuy-400" />
                    Sản Phẩm Khách Cho Vào Giỏ
                  </h2>
                  <p className="text-xs text-slate-400">
                    Sản phẩm được khách hàng thêm vào giỏ nhiều nhất
                  </p>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-thuy-900/80 text-slate-400 uppercase font-semibold text-[10px] tracking-wider border-b border-thuy-750">
                      <tr>
                        <th className="py-3 px-5">Sản Phẩm</th>
                        <th className="py-3 px-5">Giá</th>
                        <th className="py-3 px-5">Lượt Thêm Giỏ</th>
                        <th className="py-3 px-5">Số Khách</th>
                        <th className="py-3 px-5">Giá Trị Giỏ</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-thuy-750/60">
                      {cartTop.length === 0 && (
                        <tr>
                          <td
                            colSpan={5}
                            className="py-10 text-center text-slate-500"
                          >
                            Chưa có dữ liệu thêm vào giỏ
                          </td>
                        </tr>
                      )}
                      {cartTop.map((c: any, idx: number) => (
                        <tr key={idx} className="hover:bg-thuy-800/40">
                          <td className="py-3.5 px-5">
                            <p className="font-bold text-white">
                              {c.productName}
                            </p>
                            {c.productSlug && (
                              <p className="text-[10px] text-slate-500 font-mono">
                                /products/{c.productSlug}
                              </p>
                            )}
                          </td>
                          <td className="py-3.5 px-5 text-thuy-400 font-bold">
                            {formatVND(c.price)}
                          </td>
                          <td className="py-3.5 px-5 font-bold text-white">
                            {c.adds}
                          </td>
                          <td className="py-3.5 px-5 text-slate-300">
                            {c.visitors}
                          </td>
                          <td className="py-3.5 px-5 font-bold text-emerald-400">
                            {formatVND(c.potentialValue)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="rounded-2xl bg-thuy-850 border border-thuy-750 overflow-hidden shadow-xl">
                <div className="p-5 border-b border-thuy-750">
                  <h2 className="font-semibold text-base text-white">
                    Khách Vừa Thêm Vào Giỏ
                  </h2>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-thuy-900/80 text-slate-400 uppercase font-semibold text-[10px] tracking-wider border-b border-thuy-750">
                      <tr>
                        <th className="py-3 px-5">Khách</th>
                        <th className="py-3 px-5">Sản Phẩm</th>
                        <th className="py-3 px-5">Giá</th>
                        <th className="py-3 px-5">Thiết Bị</th>
                        <th className="py-3 px-5">Thời Điểm</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-thuy-750/60">
                      {cartRecent.length === 0 && (
                        <tr>
                          <td
                            colSpan={5}
                            className="py-10 text-center text-slate-500"
                          >
                            Chưa có dữ liệu
                          </td>
                        </tr>
                      )}
                      {cartRecent.map((e: any) => (
                        <tr key={e.id} className="hover:bg-thuy-800/40">
                          <td className="py-3.5 px-5">
                            {e.user ? (
                              <>
                                <p className="font-bold text-white">
                                  {e.user.name || "Khách hàng"}
                                </p>
                                <p className="text-[10px] text-thuy-300 font-mono">
                                  {e.user.email}
                                </p>
                              </>
                            ) : (
                              <>
                                <p className="font-bold text-slate-300">
                                  Khách ẩn danh
                                </p>
                                <p className="text-[10px] text-slate-500 font-mono">
                                  {(e.visitorId || "").slice(0, 8)}
                                </p>
                              </>
                            )}
                          </td>
                          <td className="py-3.5 px-5 text-slate-200">
                            {e.productName}
                          </td>
                          <td className="py-3.5 px-5 text-thuy-400 font-bold">
                            {formatVND(e.price)}
                          </td>
                          <td className="py-3.5 px-5">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                DEVICE_BADGE[e.device] ||
                                "bg-slate-800 text-slate-300 border border-slate-700"
                              }`}
                            >
                              {e.device || "Khác"}
                            </span>
                          </td>
                          <td className="py-3.5 px-5 text-slate-400 text-[11px]">
                            {formatDateTime(e.createdAt)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

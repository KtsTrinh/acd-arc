"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { formatVND, formatDateTime } from "@/lib/utils";
import { proxiedMediaUrl } from "@/lib/media-url";
import {
  CheckCircle2,
  Clock,
  Download,
  ShieldCheck,
  AlertCircle,
  Copy,
  QrCode,
  RefreshCw,
  Package,
} from "lucide-react";

const bankList = [
  { code: "VCB", shortName: "Vietcombank" },
  { code: "ACB", shortName: "ACB" },
  { code: "TCB", shortName: "Techcombank" },
  { code: "MB", shortName: "MB" },
  { code: "VTB", shortName: "VietinBank" },
  { code: "BIDV", shortName: "BIDV" },
  { code: "VPB", shortName: "VPBank" },
  { code: "TPB", shortName: "TPBank" },
  { code: "STB", shortName: "Sacombank" },
  { code: "HDB", shortName: "HDBank" },
  { code: "SHB", shortName: "SHB" },
  { code: "VIB", shortName: "VIB" },
  { code: "MSB", shortName: "MSB" },
  { code: "OCB", shortName: "OCB" },
  { code: "SCB", shortName: "SCB" },
  { code: "EIB", shortName: "Eximbank" },
  { code: "ABB", shortName: "ABBANK" },
];

function generateBankQr(
  account: string,
  bankName: string,
  accountName: string,
  amount?: number,
  addInfo?: string,
) {
  if (!account || !bankName) return "";
  const bank = bankList.find((b) =>
    bankName.toLowerCase().includes(b.shortName.toLowerCase()),
  );
  const bankCode = bank?.code || "";
  if (!bankCode) return "";
  const sep = String.fromCharCode(38);
  const amt = Math.max(0, Math.round(Number(amount || 0)));
  return (
    "https://img.vietqr.io/image/" +
    bankCode +
    "-" +
    account +
    "-compact2.png?amount=" +
    amt +
    sep +
    "addInfo=" +
    encodeURIComponent(addInfo || "Thanh toan") +
    sep +
    "accountName=" +
    encodeURIComponent(accountName || "")
  );
}

export default function OrderDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const [order, setOrder] = useState<any>(null);
  const [payment, setPayment] = useState<Record<string, string> | null>(null);
  const [loading, setLoading] = useState(true);
  const [copiedToken, setCopiedToken] = useState<string | null>(null);
  const [isSimulatingPayment, setIsSimulatingPayment] = useState(false);

  const fetchOrder = async () => {
    try {
      const res = await fetch(`/api/orders/${params.id}`);
      const data = await res.json();
      if (data.order) {
        setOrder(data.order);
      } else {
        setOrder(null);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const [orderRes, settingsRes] = await Promise.all([
          fetch(`/api/orders/${params.id}`),
          fetch("/api/settings"),
        ]);
        const orderData = await orderRes.json().catch(() => ({}));
        const settingsData = await settingsRes.json().catch(() => ({}));
        if (!mounted) return;
        setOrder(orderData.order || null);
        setPayment(settingsData.settings || {});
      } catch (err) {
        console.error(err);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [params.id]);

  const handleSimulatePayment = async () => {
    if (!order) return;
    setIsSimulatingPayment(true);
    try {
      const res = await fetch(`/api/orders/${order.id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "PAID" }),
      });
      const data = await res.json();
      if (data.order) {
        setOrder(data.order);
      } else if (data.error) {
        alert(data.error);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSimulatingPayment(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedToken(text);
    setTimeout(() => setCopiedToken(null), 2000);
  };

  if (loading) {
    return (
      <div className="pt-36 pb-20 text-center text-slate-400">
        Đang tải thông tin đơn hàng...
      </div>
    );
  }

  if (!order) {
    return (
      <div className="pt-36 pb-20 text-center space-y-4">
        <h2 className="text-xl text-white">Không tìm thấy đơn hàng.</h2>
        <Link href="/" className="text-thuy-400 text-sm underline">
          Quay lại trang chủ
        </Link>
      </div>
    );
  }

  const isPaid = order.status === "PAID";
  const qrUrl =
    (payment?.bankQrUrl || "").trim() ||
    generateBankQr(
      payment?.bankAccount || "",
      payment?.bankName || "",
      payment?.bankAccountName || "",
      order.total,
      order.orderNumber,
    );
  const hasBankInfo = Boolean(
    (payment?.bankName || payment?.bankAccount || payment?.bankAccountName || qrUrl),
  );
  const items: any[] = Array.isArray(order.items) ? order.items : [];

  return (
    <div className="pt-28 pb-24 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
      {/* Status banner */}
      <div
        className={`p-6 sm:p-8 rounded-3xl border ${
          isPaid
            ? "bg-thuy-850/90 border-emerald-500/40 shadow-glow-cyan"
            : "bg-thuy-850/90 border-amber-500/40"
        } space-y-4`}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div
              className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                isPaid
                  ? "bg-emerald-500/20 text-emerald-400"
                  : "bg-amber-500/20 text-amber-400"
              }`}
            >
              {isPaid ? (
                <CheckCircle2 className="w-6 h-6" />
              ) : (
                <Clock className="w-6 h-6" />
              )}
            </div>
            <div>
              <span className="text-[11px] uppercase tracking-wider text-slate-400 block">
                Mã Đơn Hàng: <b className="text-white">{order.orderNumber}</b>
              </span>
              <h1 className="font-display font-bold text-xl sm:text-2xl text-white">
                {isPaid
                  ? "Thanh Toán Thành Công & Cấp Quyền Tải"
                  : "Đang Chờ Xác Nhận Thanh Toán"}
              </h1>
            </div>
          </div>

          <div className="text-left sm:text-right">
            <span className="text-xs text-slate-400 block">
              Tổng thanh toán:
            </span>
            <span className="font-display font-bold text-2xl text-thuy-400 text-glow">
              {formatVND(order.total)}
            </span>
          </div>
        </div>

        {/* Action if pending */}
        {!isPaid && (
          <div className="pt-4 border-t border-thuy-750 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-xs text-amber-300">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>
                Vui lòng hoàn tất chuyển khoản theo nội dung bên dưới để mở khóa
                link tải file.
              </span>
            </div>
            <button
              onClick={handleSimulatePayment}
              disabled={isSimulatingPayment}
              className="px-4 py-2 rounded-xl bg-emerald-500 text-thuy-950 font-bold text-xs hover:brightness-110 transition-all flex items-center gap-2 shadow-md"
            >
              <RefreshCw
                className={`w-3.5 h-3.5 ${isSimulatingPayment ? "animate-spin" : ""}`}
              />
              <span>Mô Phỏng Đã Nhận Tiền (Chuyển Thành PAID)</span>
            </button>
          </div>
        )}
      </div>

      {/* If Pending: Bank Transfer / QR instructions */}
      {!isPaid && (
        <div className="p-6 rounded-2xl bg-thuy-850 border border-thuy-750 space-y-6">
          <h2 className="font-semibold text-base text-white flex items-center gap-2">
            <QrCode className="w-5 h-5 text-thuy-400" />
            <span>Thông Tin Chuyển Khoản Ngân Hàng</span>
          </h2>

          {!hasBankInfo ? (
            <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/40 text-xs text-amber-300">
              Quản trị viên chưa cấu hình tài khoản thanh toán trong CMS. Vui lòng liên hệ hỗ trợ để hoàn tất đơn hàng.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
              {/* QR */}
              <div className="p-4 rounded-xl bg-white text-center flex flex-col items-center justify-center max-w-[260px] mx-auto w-full shadow-lg">
                {qrUrl ? (
                  <img
                    src={qrUrl}
                    alt="Mã QR thanh toán"
                    className="w-56 h-56 object-contain"
                  />
                ) : (
                  <div className="w-56 h-56 bg-slate-100 flex flex-col items-center justify-center rounded-lg border border-slate-300 p-2">
                    <QrCode className="w-28 h-28 text-slate-800" />
                  </div>
                )}
                <span className="text-[11px] text-slate-700 font-semibold mt-2">
                  Quét mã để thanh toán
                </span>
                <span className="text-[10px] text-slate-500 mt-0.5">
                  Nội dung: {order.orderNumber}
                </span>
              </div>

              {/* Account Details */}
              <div className="space-y-3 text-xs">
                <div className="p-3 rounded-lg bg-thuy-900 border border-thuy-800">
                  <span className="text-slate-400 block text-[10px]">
                    Ngân hàng:
                  </span>
                  <span className="font-bold text-white text-sm">
                    {payment?.bankName || "Chưa cấu hình"}
                  </span>
                </div>
                <div className="p-3 rounded-lg bg-thuy-900 border border-thuy-800">
                  <span className="text-slate-400 block text-[10px]">
                    Số tài khoản:
                  </span>
                  <span className="font-bold text-white text-sm font-mono">
                    {payment?.bankAccount || "Chưa cấu hình"}
                  </span>
                </div>
                <div className="p-3 rounded-lg bg-thuy-900 border border-thuy-800">
                  <span className="text-slate-400 block text-[10px]">
                    Chủ tài khoản:
                  </span>
                  <span className="font-bold text-white text-sm">
                    {payment?.bankAccountName || "Chưa cấu hình"}
                  </span>
                </div>
                <div className="p-3 rounded-lg bg-thuy-900 border border-thuy-800">
                  <span className="text-slate-400 block text-[10px]">
                    Nội dung chuyển khoản (Bắt buộc):
                  </span>
                  <span className="font-bold text-emerald-400 text-sm font-mono">
                    {order.orderNumber}
                  </span>
                </div>
                <div className="p-3 rounded-lg bg-thuy-900 border border-thuy-800">
                  <span className="text-slate-400 block text-[10px]">
                    Số tiền:
                  </span>
                  <span className="font-bold text-thuy-400 text-sm">
                    {formatVND(order.total)}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Ordered products */}
      <div className="p-6 sm:p-8 rounded-3xl bg-thuy-850 border border-thuy-750 space-y-5">
        <div className="flex items-center justify-between border-b border-thuy-750 pb-4">
          <h2 className="font-display font-bold text-xl text-white flex items-center gap-2">
            <Package className="w-5 h-5 text-thuy-400" />
            <span>Sản Phẩm Trong Đơn Hàng</span>
          </h2>
          <span className="text-xs text-slate-400">{items.length} sản phẩm</span>
        </div>
        {items.length === 0 ? (
          <div className="text-center py-6 text-slate-400 text-xs">
            Không có sản phẩm trong đơn hàng này.
          </div>
        ) : (
          <div className="space-y-3">
            {items.map((item: any, idx: number) => {
              const thumb = proxiedMediaUrl(item?.product?.thumbnail);
              return (
                <div
                  key={item.id || idx}
                  className="flex items-center justify-between gap-4 p-4 rounded-2xl bg-thuy-900 border border-thuy-700/80"
                >
                  <div className="flex items-center gap-4 min-w-0">
                    {thumb ? (
                      <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-thuy-950 flex-shrink-0">
                        <Image src={thumb} alt={item.productName || "Sản phẩm"} fill className="object-cover" unoptimized />
                      </div>
                    ) : (
                      <div className="w-16 h-16 rounded-xl bg-thuy-800 flex items-center justify-center text-slate-500 flex-shrink-0">
                        <Package className="w-6 h-6" />
                      </div>
                    )}
                    <div className="min-w-0">
                      <p className="font-semibold text-sm text-white truncate">
                        {item.productName || item?.product?.name || "Sản phẩm"}
                      </p>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Số lượng: <b className="text-white">{item.quantity || 1}</b>
                      </p>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <span className="font-bold text-sm text-thuy-400">{formatVND(item.price || 0)}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* If Paid: Secure Download Links Center */}
      {isPaid && (
        <div className="p-6 sm:p-8 rounded-3xl bg-thuy-850 border border-thuy-750 space-y-6">
          <div className="flex items-center justify-between border-b border-thuy-750 pb-4">
            <div>
              <h2 className="font-display font-bold text-xl text-white flex items-center gap-2">
                <Download className="w-5 h-5 text-thuy-400" />
                <span>Liên Kết Tải File Bản Quyền Kỹ Thuật Số</span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Link tải trực tiếp tốc độ cao từ máy chủ bảo mật ACD Studio.
              </p>
            </div>
            <div className="hidden sm:flex items-center gap-1.5 text-xs text-emerald-400 bg-emerald-500/10 px-3 py-1.5 rounded-lg border border-emerald-500/20">
              <ShieldCheck className="w-4 h-4" />
              <span>Đã xác minh thanh toán</span>
            </div>
          </div>

          {/* Download Items */}
          <div className="space-y-4">
            {order.downloads && order.downloads.length > 0 ? (
              order.downloads.map((dl: any, idx: number) => {
                const downloadUrl = `/api/downloads/${dl.token}`;
                const remainingMs =
                  new Date(dl.expiresAt).getTime() - new Date().getTime();
                const remainingMinutes = Math.max(
                  0,
                  Math.floor(remainingMs / 60000),
                );
                const remainingSeconds = Math.max(
                  0,
                  Math.floor((remainingMs % 60000) / 1000),
                );
                const isExpired = remainingMs <= 0;

                return (
                  <div
                    key={dl.id || idx}
                    className="p-5 rounded-2xl bg-thuy-900 border border-thuy-700/80 space-y-4 hover:border-thuy-400 transition-colors"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded bg-thuy-800 text-thuy-300 text-[10px] font-bold border border-thuy-700">
                            FILE #{idx + 1}
                          </span>
                          <span className="text-xs text-slate-400">
                            {isExpired ? (
                              <b className="text-red-400">Link đã hết hạn</b>
                            ) : (
                              <>
                                Hạn tải còn lại:{" "}
                                <b className="text-emerald-400">
                                  {remainingMinutes} phút {remainingSeconds}{" "}
                                  giây
                                </b>
                              </>
                            )}
                          </span>
                        </div>
                        <h3 className="font-semibold text-sm sm:text-base text-white">
                          {dl.product?.name ||
                            "Gói tài nguyên hồ sơ thiết kế kèm theo đơn hàng"}
                        </h3>
                        <p className="text-xs text-slate-400">
                          Lượt tải đã dùng:{" "}
                          <b className="text-white">{dl.downloadCount}</b> /{" "}
                          {dl.maxDownloads} lần
                        </p>
                      </div>

                      {/* Direct Download Button */}
                      <a
                        href={downloadUrl}
                        download
                        className="py-3 px-6 rounded-xl font-bold text-xs uppercase tracking-wider text-thuy-950 bg-gradient-to-r from-thuy-400 to-aqua-400 hover:brightness-110 shadow-glow-cyan transition-all flex items-center justify-center gap-2"
                      >
                        <Download className="w-4 h-4" />
                        <span>Tải File Ngay</span>
                      </a>
                    </div>

                    {/* Token details for transparency */}
                    <div className="pt-3 border-t border-thuy-800/80 flex flex-col sm:flex-row sm:items-center justify-between text-[11px] text-slate-500 gap-2 font-mono">
                      <span className="truncate max-w-sm">
                        Mã token: {dl.token} · gắn với tài khoản đã thanh toán
                      </span>
                      <button
                        onClick={() =>
                          copyToClipboard(
                            `${window.location.origin}${downloadUrl}`,
                          )
                        }
                        className="text-thuy-400 hover:text-white transition-colors flex items-center gap-1 self-start sm:self-auto"
                      >
                        <Copy className="w-3.5 h-3.5" />
                        <span>
                          {copiedToken ? "Đã copy link ✓" : "Copy link tải"}
                        </span>
                      </button>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-6 text-slate-400 text-xs">
                Đang khởi tạo liên kết tải về cho đơn hàng...
              </div>
            )}
          </div>
        </div>
      )}

      {/* Order Summary & Customer details */}
      <div className="p-6 rounded-2xl bg-thuy-850/60 border border-thuy-750 space-y-4">
        <h3 className="font-semibold text-sm uppercase tracking-wider text-thuy-300">
          Chi Tiết Đơn Hàng
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="space-y-1">
            <span className="text-slate-400">Họ tên người nhận:</span>
            <p className="font-medium text-white">{order.customerName}</p>
          </div>
          <div className="space-y-1">
            <span className="text-slate-400">Email nhận link:</span>
            <p className="font-medium text-white">{order.customerEmail}</p>
          </div>
          <div className="space-y-1">
            <span className="text-slate-400">Thời gian tạo:</span>
            <p className="font-medium text-white">
              {formatDateTime(order.createdAt)}
            </p>
          </div>
          <div className="space-y-1">
            <span className="text-slate-400">Hình thức thanh toán:</span>
            <p className="font-medium text-white">{order.paymentMethod}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

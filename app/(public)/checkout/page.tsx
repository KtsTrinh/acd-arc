"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { useCartStore } from "@/lib/cart";
import { useCurrentUser } from "@/components/auth/useCurrentUser";
import { formatVND } from "@/lib/utils";
import {
  CreditCard,
  QrCode,
  ShieldCheck,
  CheckCircle2,
  Lock,
  ArrowRight,
  ArrowLeft,
  Loader2,
  AlertCircle,
} from "lucide-react";

export default function CheckoutPage() {
  const router = useRouter();
  const { items, totalPrice, clearCart } = useCartStore();
  const { user, loading: authLoading } = useCurrentUser();
  const [mounted, setMounted] = useState(false);

  // Form states
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"VIETQR" | "BANK_TRANSFER">("VIETQR");
  const [autoPay, setAutoPay] = useState(true); // Allows instant server-side payment simulation
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    setMounted(true);
  }, []);

  // Bắt buộc đăng nhập mới được thanh toán
  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.replace("/login?from=%2Fcheckout");
    }
  }, [authLoading, user, router]);

  // Tự động điền thông tin khách hàng từ hồ sơ đã đăng nhập
  useEffect(() => {
    if (!user) return;
    if (user.name && !customerName) setCustomerName(user.name);
    if (user.email && !customerEmail) setCustomerEmail(user.email);
    if (user.phone && !customerPhone) setCustomerPhone(user.phone);
  }, [user, customerName, customerEmail, customerPhone]);

  if (!mounted || authLoading || !user) return null;

  if (items.length === 0) {
    return (
      <div className="pt-36 pb-20 text-center space-y-4">
        <h2 className="text-xl text-white">Giỏ hàng của bạn đang trống.</h2>
        <Link href="/products" className="text-thuy-400 text-sm underline">
          Quay lại chọn sản phẩm
        </Link>
      </div>
    );
  }

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    if (!customerName || !customerEmail) {
      setErrorMessage("Vui lòng điền họ tên và email để nhận liên kết tải file.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName,
          customerEmail,
          customerPhone,
          paymentMethod,
          items,
          autoPay, // Server sets status = PAID and generates download tokens
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Không thể tạo đơn hàng.");
      }

      // Clear cart upon successful order
      clearCart();

      // Redirect to Order Confirmation & Download Center
      router.push(`/orders/${data.order.id}`);
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || "Đã xảy ra lỗi khi tạo đơn hàng.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="pt-28 pb-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
      <div className="space-y-2">
        <Link
          href="/cart"
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-thuy-400 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Quay lại giỏ hàng</span>
        </Link>
        <h1 className="font-display font-bold text-3xl sm:text-4xl text-white">
          Thanh Toán & Kích Hoạt Tải File
        </h1>
        <p className="text-xs sm:text-sm text-slate-400">
          Vui lòng kiểm tra email chính xác. Liên kết tải mã hóa sẽ được gửi tới email của bạn.
        </p>
      </div>

      {errorMessage && (
        <div className="p-4 rounded-xl bg-red-950/60 border border-red-700 text-red-300 text-xs flex items-center gap-3">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      <form onSubmit={handleSubmitOrder} className="grid grid-cols-1 lg:grid-cols-3 gap-10 items-start">
        {/* Left Form: Customer Details & Payment Options */}
        <div className="lg:col-span-2 space-y-6">
          {/* Customer info card */}
          <div className="p-6 rounded-2xl bg-thuy-850 border border-thuy-750 space-y-4">
            <h3 className="font-semibold text-base text-white flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-thuy-400 text-thuy-950 text-xs font-bold flex items-center justify-center">
                1
              </span>
              <span>Thông Tin Khách Hàng</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5 sm:col-span-2">
                <label className="text-xs font-medium text-slate-300">
                  Họ và tên <span className="text-red-400">*</span>:
                </label>
                <input
                  type="text"
                  required
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Nguyễn Văn A"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-thuy-900 border border-thuy-700 text-xs text-white focus:outline-none focus:border-thuy-400"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-300">
                  Email nhận link tải <span className="text-red-400">*</span>:
                </label>
                <input
                  type="email"
                  required
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  placeholder="name@gmail.com"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-thuy-900 border border-thuy-700 text-xs text-white focus:outline-none focus:border-thuy-400"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-300">Số điện thoại:</label>
                <input
                  type="tel"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  placeholder="0988xxxxxx"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-thuy-900 border border-thuy-700 text-xs text-white focus:outline-none focus:border-thuy-400"
                />
              </div>
            </div>
          </div>

          {/* Payment Method card */}
          <div className="p-6 rounded-2xl bg-thuy-850 border border-thuy-750 space-y-4">
            <h3 className="font-semibold text-base text-white flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-thuy-400 text-thuy-950 text-xs font-bold flex items-center justify-center">
                2
              </span>
              <span>Phương Thức Thanh Toán</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <label
                onClick={() => setPaymentMethod("VIETQR")}
                className={`p-4 rounded-xl border-2 cursor-pointer transition-all flex items-start gap-3 ${
                  paymentMethod === "VIETQR"
                    ? "border-thuy-400 bg-thuy-800/80 shadow-glow-cyan"
                    : "border-thuy-700 bg-thuy-900 hover:border-thuy-600"
                }`}
              >
                <QrCode className="w-5 h-5 text-thuy-400 mt-0.5" />
                <div>
                  <h4 className="text-xs font-semibold text-white">Mã VietQR Tự Động</h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Quét mã QR từ mọi ứng dụng Mobile Banking (VCB, TCB, MB...)
                  </p>
                </div>
              </label>

              <label
                onClick={() => setPaymentMethod("BANK_TRANSFER")}
                className={`p-4 rounded-xl border-2 cursor-pointer transition-all flex items-start gap-3 ${
                  paymentMethod === "BANK_TRANSFER"
                    ? "border-thuy-400 bg-thuy-800/80 shadow-glow-cyan"
                    : "border-thuy-700 bg-thuy-900 hover:border-thuy-600"
                }`}
              >
                <CreditCard className="w-5 h-5 text-thuy-400 mt-0.5" />
                <div>
                  <h4 className="text-xs font-semibold text-white">Chuyển Khoản Ngân Hàng</h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Số tài khoản chuyên dụng ACD Studio Studio Tech
                  </p>
                </div>
              </label>
            </div>

            {/* Test Simulation Mode Switch */}
            <div className="p-4 rounded-xl bg-thuy-900/90 border border-thuy-700 flex items-center justify-between">
              <div className="space-y-0.5">
                <span className="text-xs font-semibold text-thuy-300 block">
                  Mô phỏng xác nhận thanh toán tự động (Instant Webhook Demo)
                </span>
                <span className="text-[11px] text-slate-400 block">
                  Tự động xác nhận PAID & sinh link tải (hiệu lực 5 phút) gắn với đúng tài khoản đã thanh toán.
                </span>
              </div>
              <input
                type="checkbox"
                checked={autoPay}
                onChange={(e) => setAutoPay(e.target.checked)}
                className="w-5 h-5 accent-thuy-400 rounded cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Right Summary & Confirm */}
        <div className="p-6 rounded-2xl bg-thuy-850 border border-thuy-750 space-y-6">
          <h3 className="font-display font-bold text-lg text-white border-b border-thuy-750 pb-3">
            Đơn Hàng Của Bạn
          </h3>

          <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
            {items.map((i) => (
              <div key={i.id} className="flex justify-between text-xs gap-3">
                <div className="min-w-0">
                  <p className="font-medium text-slate-200 truncate">{i.name}</p>
                  <span className="text-[10px] text-slate-400">{i.type}</span>
                </div>
                <span className="font-semibold text-thuy-400 flex-shrink-0">
                  {formatVND(i.price)}
                </span>
              </div>
            ))}
          </div>

          <div className="pt-4 border-t border-thuy-750 space-y-2 text-xs">
            <div className="flex justify-between text-slate-300">
              <span>Tạm tính:</span>
              <span>{formatVND(totalPrice())}</span>
            </div>
            <div className="flex justify-between text-slate-300">
              <span>Phí xử lý & cấp quyền:</span>
              <span className="text-emerald-400">0 ₫</span>
            </div>
            <div className="pt-2 flex justify-between items-baseline text-sm">
              <span className="font-semibold text-white">Tổng thanh toán:</span>
              <span className="font-display font-bold text-2xl text-thuy-400 text-glow">
                {formatVND(totalPrice())}
              </span>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-thuy-900 border border-thuy-800 flex items-start gap-2 text-xs text-slate-400">
            <Lock className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
            <span>Mọi giao dịch được mã hóa và bảo mật theo chuẩn an toàn quốc tế.</span>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-4 px-6 rounded-xl font-bold text-xs uppercase tracking-wider text-thuy-950 bg-gradient-to-r from-thuy-400 to-aqua-400 hover:brightness-110 shadow-glow-cyan transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Đang xử lý đơn hàng...</span>
              </>
            ) : (
              <>
                <span>Xác Nhận & Nhận Link Tải</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}


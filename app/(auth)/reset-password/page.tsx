"use client";

import React, { Suspense, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2, AlertCircle, Lock, Phone, ArrowLeft } from "lucide-react";
import OtpInput from "@/components/auth/OtpInput";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = useMemo(() => searchParams.get("token"), [searchParams]);

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (password.length < 6) {
      setError("Mật khẩu phải có ít nhất 6 ký tự.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Hai mật khẩu không khớp.");
      return;
    }

    if (!token && (!phone || code.length < 6)) {
      setError("Vui lòng nhập số điện thoại và mã xác minh đã nhận.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(
          token
            ? { token, password }
            : { phone, code, password }
        ),
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Đặt lại mật khẩu thất bại.");

      setSuccess(data.message);
      setTimeout(() => router.push("/login"), 2500);
    } catch (err: any) {
      setError(err.message || "Đã có lỗi xảy ra.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-20 px-4 sm:px-6 lg:px-8 relative">
      <div className="max-w-md w-full space-y-8 bg-thuy-850/90 border border-thuy-700 p-8 rounded-3xl shadow-2xl backdrop-blur-xl relative z-10">
        <div className="text-center space-y-2">
          <Link href="/" className="inline-flex items-center gap-2 mb-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-thuy-400 to-thuy-700 flex items-center justify-center font-bold text-white shadow-glow-cyan">
              ACD
            </div>
          </Link>
          <h2 className="font-display font-bold text-2xl text-white">
            Đặt Lại Mật Khẩu
          </h2>
          <p className="text-xs text-slate-400">
            {token
              ? "Nhập mật khẩu mới cho tài khoản của bạn"
              : "Nhập số điện thoại và mã xác minh đã nhận qua SMS"}
          </p>
        </div>

        {error && (
          <div className="p-3.5 rounded-xl bg-red-950/70 border border-red-700 text-red-300 text-xs flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="p-3.5 rounded-xl bg-aqua-500/10 border border-aqua-500/40 text-aqua-400 text-xs">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {!token && (
            <>
              <div className="space-y-1">
                <label className="text-xs text-slate-300 font-medium">
                  Số điện thoại:
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                  <input
                    type="tel"
                    required
                    inputMode="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="0912345678"
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-thuy-900 border border-thuy-700 text-xs text-white focus:outline-none focus:border-thuy-400"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs text-slate-300 font-medium block">
                  Mã xác minh:
                </label>
                <OtpInput value={code} onChange={setCode} />
              </div>
            </>
          )}

          <div className="space-y-1">
            <label className="text-xs text-slate-300 font-medium">
              Mật khẩu mới:
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-thuy-900 border border-thuy-700 text-xs text-white focus:outline-none focus:border-thuy-400"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs text-slate-300 font-medium">
              Xác nhận mật khẩu mới:
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
              <input
                type="password"
                required
                minLength={6}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-thuy-900 border border-thuy-700 text-xs text-white focus:outline-none focus:border-thuy-400"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 rounded-xl font-bold text-xs uppercase tracking-wider text-thuy-950 bg-gradient-to-r from-thuy-400 to-aqua-400 hover:brightness-110 shadow-glow-cyan transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <span>Đặt Lại Mật Khẩu</span>
            )}
          </button>
        </form>

        <div className="text-center text-xs text-slate-400">
          <Link
            href="/login"
            className="inline-flex items-center gap-1 text-thuy-400 hover:underline font-semibold"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Quay lại đăng nhập
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="min-h-screen" />}>
      <ResetPasswordForm />
    </Suspense>
  );
}

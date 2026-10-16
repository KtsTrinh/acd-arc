"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Lock, Mail, ArrowRight, Loader2, AlertCircle, Shield } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Đăng nhập thất bại.");
      }

      if (data.user?.role === "ADMIN") {
        router.push("/admin");
      } else {
        router.push("/account");
      }
      router.refresh();
    } catch (err: any) {
      setError(err.message || "Đã xảy ra lỗi đăng nhập.");
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = (demoEmail: string, demoPass: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-20 px-4 sm:px-6 lg:px-8 relative">
      <div className="max-w-md w-full space-y-8 bg-thuy-850/90 border border-thuy-750 p-8 rounded-3xl shadow-2xl backdrop-blur-xl relative z-10">
        <div className="text-center space-y-2">
          <Link href="/" className="inline-flex items-center gap-2 mb-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-thuy-400 to-thuy-700 flex items-center justify-center font-bold text-white shadow-glow-cyan">
              ACD
            </div>
          </Link>
          <h2 className="font-display font-bold text-2xl text-white">Đăng Nhập Tài Khoản</h2>
          <p className="text-xs text-slate-400">
            Truy cập cổng quản trị CMS hoặc quản lý các liên kết tải tài nguyên
          </p>
        </div>

        {error && (
          <div className="p-3.5 rounded-xl bg-red-950/70 border border-red-700 text-red-300 text-xs flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs text-slate-300 font-medium">Email:</label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@acd.vn"
                className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-thuy-900 border border-thuy-700 text-xs text-white focus:outline-none focus:border-thuy-400"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs text-slate-300 font-medium">Mật khẩu:</label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
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
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>Đăng Nhập</span>}
          </button>
        </form>

        {/* Quick Demo Credentials */}
        <div className="pt-4 border-t border-thuy-750/80 space-y-2">
          <span className="text-[11px] text-slate-400 font-medium block text-center">
            Tài khoản mẫu để kiểm thử nhanh:
          </span>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleQuickLogin("admin@acd.vn", "admin123")}
              className="px-3 py-2 rounded-lg bg-thuy-900 hover:bg-thuy-800 border border-thuy-700 text-[11px] text-thuy-300 text-left transition-colors"
            >
              <b className="block text-white">Quản Trị (ADMIN)</b>
              admin@acd.vn
            </button>
            <button
              type="button"
              onClick={() => handleQuickLogin("khachhang@gmail.com", "user123")}
              className="px-3 py-2 rounded-lg bg-thuy-900 hover:bg-thuy-800 border border-thuy-700 text-[11px] text-slate-300 text-left transition-colors"
            >
              <b className="block text-white">Khách Hàng (USER)</b>
              khachhang@gmail.com
            </button>
          </div>
        </div>

        <div className="text-center text-xs text-slate-400">
          Chưa có tài khoản?{" "}
          <Link href="/register" className="text-thuy-400 hover:underline font-semibold">
            Đăng ký ngay
          </Link>
        </div>
      </div>
    </div>
  );
}


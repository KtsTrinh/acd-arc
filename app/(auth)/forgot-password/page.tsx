"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Loader2, AlertCircle, Mail, KeyRound, ArrowLeft } from "lucide-react";

export default function ForgotPasswordPage() {
  const [identifier, setIdentifier] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [delivered, setDelivered] = useState<string[]>([]);
  const [channels, setChannels] = useState<{ email: boolean; sms: boolean } | null>(
    null
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setDelivered([]);
    setLoading(true);

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier }),
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Không thể xử lý yêu cầu.");

      setSuccess(data.message);
      setDelivered(data.delivered || []);
      setChannels(data.channels || null);
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
            Quên Mật Khẩu
          </h2>
          <p className="text-xs text-slate-400">
            Nhập email đã đăng ký để nhận hướng dẫn đặt lại mật khẩu
          </p>
        </div>

        {error && (
          <div className="p-3.5 rounded-xl bg-red-950/70 border border-red-700 text-red-300 text-xs flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="space-y-3">
            <div className="p-3.5 rounded-xl bg-aqua-500/10 border border-aqua-500/40 text-aqua-400 text-xs flex items-start gap-2.5">
              <KeyRound className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>{success}</span>
            </div>
            {delivered.length > 0 && (
              <div className="p-3.5 rounded-xl bg-thuy-900 border border-thuy-700 text-[11px] text-slate-400 space-y-1">
                <p className="font-semibold text-thuy-300">Kênh đã gửi:</p>
                {delivered.map((item) => (
                  <p key={item}>{item}</p>
                ))}
              </div>
            )}
            {channels && !channels.email && !channels.sms && (
              <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/40 text-amber-400 text-xs">
                Dịch vụ gửi email và tin nhắn hiện chưa được cấu hình nên chưa thể
                gửi mã đặt lại mật khẩu. Vui lòng liên hệ quản trị viên.
              </div>
            )}
            {channels && (channels.email || channels.sms) && delivered.length === 0 && (
              <div className="p-3.5 rounded-xl bg-thuy-900 border border-thuy-700 text-[11px] text-slate-400">
                Không tìm thấy tài khoản nào khớp với thông tin đã nhập.
              </div>
            )}
          </div>
        )}

        {!success && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs text-slate-300 font-medium">
                Email hoặc số điện thoại:
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                <input
                  type="text"
                  required
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="name@gmail.com hoặc 0912345678"
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
                <span>Gửi Hướng Dẫn</span>
              )}
            </button>
          </form>
        )}

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

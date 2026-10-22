"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  ShieldCheck,
  Loader2,
  AlertCircle,
  ArrowLeft,
  KeyRound,
  Smartphone,
  Copy,
  Check,
} from "lucide-react";
import OtpInput from "@/components/auth/OtpInput";

type SetupData = {
  secret: string;
  otpauthUri: string;
  qrCodeDataUrl: string;
  issuer: string;
  accountName: string;
};

export default function AccountSecurityPage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [setup, setSetup] = useState<SetupData | null>(null);
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [copied, setCopied] = useState(false);

  const loadUser = async () => {
    const res = await fetch("/api/auth/me");
    const data = await res.json();
    setUser(data.user);
    setLoading(false);
  };

  useEffect(() => {
    loadUser();
  }, []);

  const startSetup = async () => {
    setError("");
    setSuccess("");
    setBusy(true);

    try {
      const res = await fetch("/api/auth/2fa/setup", { method: "POST" });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Không thể khởi tạo 2FA.");

      setSetup(data);
    } catch (err: any) {
      setError(err.message || "Đã có lỗi xảy ra.");
    } finally {
      setBusy(false);
    }
  };

  const enableTwoFactor = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setBusy(true);

    try {
      const res = await fetch("/api/auth/2fa/enable", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Không thể bật 2FA.");

      setSuccess(data.message);
      setSetup(null);
      setCode("");
      await loadUser();
    } catch (err: any) {
      setError(err.message || "Đã có lỗi xảy ra.");
    } finally {
      setBusy(false);
    }
  };

  const disableTwoFactor = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setBusy(true);

    try {
      const res = await fetch("/api/auth/2fa/disable", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, password }),
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Không thể tắt 2FA.");

      setSuccess(data.message);
      setCode("");
      setPassword("");
      await loadUser();
    } catch (err: any) {
      setError(err.message || "Đã có lỗi xảy ra.");
    } finally {
      setBusy(false);
    }
  };

  const copySecret = async () => {
    if (!setup) return;
    await navigator.clipboard.writeText(setup.secret);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="pt-36 pb-20 text-center text-slate-400">
        Đang tải thông tin bảo mật...
      </div>
    );
  }

  if (!user) {
    return (
      <div className="pt-36 pb-24 max-w-md mx-auto px-4 text-center space-y-4">
        <div className="w-16 h-16 mx-auto rounded-full bg-thuy-800 flex items-center justify-center text-thuy-400">
          <ShieldCheck className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-white">Bạn chưa đăng nhập</h2>
        <Link
          href="/login"
          className="inline-block px-6 py-3 rounded-xl bg-thuy-400 text-thuy-950 font-bold text-xs uppercase tracking-wider hover:brightness-110 shadow-glow-cyan"
        >
          Đăng nhập ngay
        </Link>
      </div>
    );
  }

  const enabled = Boolean(user.twoFactorEnabled);

  return (
    <div className="pt-28 pb-24 max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
      <div className="flex items-center justify-between border-b border-thuy-800 pb-4">
        <h1 className="font-display font-bold text-2xl text-white flex items-center gap-2.5">
          <ShieldCheck className="w-6 h-6 text-thuy-400" />
          <span>Bảo Mật Tài Khoản</span>
        </h1>
        <Link
          href="/account"
          className="inline-flex items-center gap-1 text-xs text-thuy-400 hover:underline font-semibold"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Về tài khoản
        </Link>
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

      <div className="p-6 rounded-3xl bg-thuy-850 border border-thuy-700 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <h2 className="font-display font-bold text-lg text-white flex items-center gap-2">
              <Smartphone className="w-4.5 h-4.5 text-thuy-400" />
              <span>Xác thực 2 lớp (TOTP)</span>
            </h2>
            <p className="text-xs text-slate-400">
              {enabled
                ? "Tài khoản đang được bảo vệ bằng mã xác thực sinh ra từ ứng dụng xác thực."
                : "Tăng cường bảo mật bằng mã 6 chữ số từ Google Authenticator, Authy hoặc 1Password."}
            </p>
          </div>
          <span
            className={`px-3 py-1 rounded-full text-[10px] font-bold border self-start ${
              enabled
                ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/40"
                : "bg-amber-500/15 text-amber-400 border-amber-500/40"
            }`}
          >
            {enabled ? "ĐANG BẬT" : "ĐANG TẮT"}
          </span>
        </div>

        {!enabled && !setup && (
          <button
            type="button"
            onClick={startSetup}
            disabled={busy}
            className="w-full sm:w-auto px-6 py-3 rounded-xl font-bold text-xs uppercase tracking-wider text-thuy-950 bg-gradient-to-r from-thuy-400 to-aqua-400 hover:brightness-110 shadow-glow-cyan transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {busy ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <KeyRound className="w-4 h-4" />
                <span>Bật xác thực 2 lớp</span>
              </>
            )}
          </button>
        )}

        {setup && (
          <div className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-[auto,1fr] gap-6 items-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={setup.qrCodeDataUrl}
                alt="QR đăng ký ứng dụng xác thực"
                className="w-44 h-44 rounded-2xl bg-white p-2 mx-auto sm:mx-0"
              />

              <div className="space-y-3 text-xs text-slate-300">
                <p>
                  Quét mã QR bằng ứng dụng xác thực, hoặc nhập thủ công mã bí
                  mật:
                </p>
                <div className="flex items-center gap-2">
                  <code className="flex-1 px-3 py-2 rounded-lg bg-thuy-900 border border-thuy-700 text-[11px] text-thuy-300 break-all">
                    {setup.secret}
                  </code>
                  <button
                    type="button"
                    onClick={copySecret}
                    className="px-3 py-2 rounded-lg bg-thuy-900 border border-thuy-700 hover:border-thuy-500 transition-colors"
                    title="Sao chép mã bí mật"
                  >
                    {copied ? (
                      <Check className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                </div>
                <p className="text-[11px] text-slate-500">
                  Nhấn "Bật" chỉ khi ứng dụng đã hiển thị mã 6 chữ số.
                </p>
              </div>
            </div>

            <form onSubmit={enableTwoFactor} className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs text-slate-300 font-medium block">
                  Mã xác thực 6 chữ số:
                </label>
                <OtpInput value={code} onChange={setCode} autoFocus />
              </div>

              <button
                type="submit"
                disabled={busy || code.length < 6}
                className="w-full sm:w-auto px-6 py-3 rounded-xl font-bold text-xs uppercase tracking-wider text-thuy-950 bg-gradient-to-r from-thuy-400 to-aqua-400 hover:brightness-110 shadow-glow-cyan transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {busy ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <span>Xác nhận & Bật</span>
                )}
              </button>
            </form>
          </div>
        )}

        {enabled && (
          <form onSubmit={disableTwoFactor} className="space-y-4 pt-2">
            <div className="space-y-2">
              <label className="text-xs text-slate-300 font-medium block">
                Nhập mã xác thực hiện tại hoặc mật khẩu để tắt:
              </label>
              <OtpInput value={code} onChange={setCode} />
            </div>

            <div className="space-y-1">
              <label className="text-xs text-slate-300 font-medium">
                Mật khẩu hiện tại (tùy chọn):
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3 py-2.5 rounded-xl bg-thuy-900 border border-thuy-700 text-xs text-white focus:outline-none focus:border-thuy-400"
              />
            </div>

            <button
              type="submit"
              disabled={busy}
              className="w-full sm:w-auto px-6 py-3 rounded-xl font-bold text-xs uppercase tracking-wider bg-red-950/70 hover:bg-red-900/70 text-red-300 border border-red-800 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {busy ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <span>Tắt xác thực 2 lớp</span>
              )}
            </button>
          </form>
        )}
      </div>

      <div className="p-6 rounded-3xl bg-thuy-850 border border-thuy-700 space-y-3">
        <h3 className="font-display font-bold text-base text-white">
          Thông tin đăng nhập
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className="p-3.5 rounded-xl bg-thuy-900 border border-thuy-800">
            <p className="text-slate-500 uppercase tracking-wider text-[10px]">
              Email
            </p>
            <p className="text-thuy-300 font-semibold mt-1">
              {user.email || "Chưa liên kết"}
            </p>
          </div>
          <div className="p-3.5 rounded-xl bg-thuy-900 border border-thuy-800">
            <p className="text-slate-500 uppercase tracking-wider text-[10px]">
              Số điện thoại
            </p>
            <p className="text-thuy-300 font-semibold mt-1">
              {user.phone || "Chưa liên kết"}
            </p>
          </div>
          <div className="p-3.5 rounded-xl bg-thuy-900 border border-thuy-800">
            <p className="text-slate-500 uppercase tracking-wider text-[10px]">
              Email đã xác minh
            </p>
            <p className="text-thuy-300 font-semibold mt-1">
              {user.emailVerified ? "Có" : "Chưa"}
            </p>
          </div>
          <div className="p-3.5 rounded-xl bg-thuy-900 border border-thuy-800">
            <p className="text-slate-500 uppercase tracking-wider text-[10px]">
              Số điện thoại đã xác minh
            </p>
            <p className="text-thuy-300 font-semibold mt-1">
              {user.phoneVerified ? "Có" : "Chưa"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

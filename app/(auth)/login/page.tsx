"use client";

import React, { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Lock,
  Mail,
  Loader2,
  AlertCircle,
  Phone,
  ShieldCheck,
  ArrowLeft,
} from "lucide-react";
import SocialButtons from "@/components/auth/SocialButtons";
import OtpInput from "@/components/auth/OtpInput";
import { useProviders } from "@/components/auth/useProviders";

const OAUTH_ERRORS: Record<string, string> = {
  oauth_provider: "Nhà cung cấp đăng nhập không hợp lệ.",
  oauth_not_configured:
    "Phương thức đăng nhập này chưa được cấu hình. Vui lòng liên hệ quản trị viên.",
  oauth_cancelled: "Bạn đã hủy đăng nhập.",
  oauth_missing_code: "Không nhận được mã xác thực từ nhà cung cấp.",
  oauth_invalid_state: "Phiên đăng nhập không hợp lệ hoặc đã hết hạn. Vui lòng thử lại.",
  oauth_missing_profile: "Không lấy được thông tin tài khoản từ nhà cung cấp.",
  oauth_failed: "Đăng nhập bằng nhà cung cấp không thành công. Vui lòng thử lại.",
};

type Step = "credentials" | "otp" | "two-factor";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [mode, setMode] = useState<"email" | "phone">("email");
  const [step, setStep] = useState<Step>("credentials");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [twoFactorCode, setTwoFactorCode] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const providers = useProviders();

  useEffect(() => {
    const oauthError = searchParams.get("error");
    if (oauthError && OAUTH_ERRORS[oauthError]) {
      setError(OAUTH_ERRORS[oauthError]);
    }
  }, [searchParams]);

  const fromParam = searchParams.get("from");
  const safeFrom =
    fromParam && fromParam.startsWith("/") && !fromParam.startsWith("//")
      ? fromParam
      : null;

  const goTo = (fallback: string) => {
    router.push(safeFrom || fallback);
    router.refresh();
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
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

      if (!res.ok) throw new Error(data.error || "Đăng nhập thất bại.");

      if (data.twoFactorRequired) {
        setStep("two-factor");
        setNotice(data.message || "Nhập mã xác thực để hoàn tất đăng nhập.");
        return;
      }

      goTo(data.user?.role === "ADMIN" ? "/admin" : "/account");
    } catch (err: any) {
      setError(err.message || "Đã có lỗi xảy ra khi đăng nhập.");
    } finally {
      setLoading(false);
    }
  };

  const handleSendPhoneOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setNotice("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login/phone", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone }),
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Không thể gửi mã xác minh.");

      setStep("otp");
      setNotice(data.message || "Mã xác minh đã được gửi tới số điện thoại của bạn.");
    } catch (err: any) {
      setError(err.message || "Đã có lỗi xảy ra.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyPhoneOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login/phone/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, code: otp }),
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Mã xác minh không đúng.");

      goTo(data.user?.role === "ADMIN" ? "/admin" : "/account");
    } catch (err: any) {
      setError(err.message || "Đã có lỗi xảy ra.");
    } finally {
      setLoading(false);
    }
  };

  const handleTwoFactor = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/2fa/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: twoFactorCode }),
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Mã xác thực không đúng.");

      goTo(data.user?.role === "ADMIN" ? "/admin" : "/account");
    } catch (err: any) {
      setError(err.message || "Đã có lỗi xảy ra.");
    } finally {
      setLoading(false);
    }
  };

  const resetFlow = () => {
    setStep("credentials");
    setOtp("");
    setTwoFactorCode("");
    setError("");
    setNotice("");
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
            Đăng Nhập Tài Khoản
          </h2>
          <p className="text-xs text-slate-400">
            Quản lý tài nguyên CAD, 3D model và lịch sử mua hàng của bạn
          </p>
        </div>

        {error && (
          <div className="p-3.5 rounded-xl bg-red-950/70 border border-red-700 text-red-300 text-xs flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {notice && (
          <div className="p-3.5 rounded-xl bg-aqua-500/10 border border-aqua-500/40 text-aqua-400 text-xs flex items-start gap-2.5">
            <ShieldCheck className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span>{notice}</span>
          </div>
        )}

        {step === "credentials" && (
          <>
            <form onSubmit={handleEmailLogin} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs text-slate-300 font-medium">Email:</label>
                  <div className="relative">
                    <Mail className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                    <input
                      type="email"
                      required
                      autoComplete="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@gmail.com"
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-thuy-900 border border-thuy-700 text-xs text-white focus:outline-none focus:border-thuy-400"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="text-xs text-slate-300 font-medium">
                      Mật khẩu:
                    </label>
                    <Link
                      href="/forgot-password"
                      className="text-[11px] text-thuy-400 hover:underline font-semibold"
                    >
                      Quên mật khẩu?
                    </Link>
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                    <input
                      type="password"
                      required
                      autoComplete="current-password"
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
                  {loading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <span>Đăng Nhập</span>
                  )}
                </button>
              </form>

            <SocialButtons text="Đăng nhập" from={safeFrom} />
          </>
        )}

        {step === "otp" && (
          <form onSubmit={handleVerifyPhoneOtp} className="space-y-4">
            <div className="flex items-center gap-2 text-xs text-slate-300">
              <button
                type="button"
                onClick={resetFlow}
                className="inline-flex items-center gap-1 text-thuy-400 hover:underline font-semibold"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Quay lại
              </button>
            </div>

            <div className="space-y-2">
              <label className="text-xs text-slate-300 font-medium block">
                Nhập mã xác minh gửi tới {phone}
              </label>
              <OtpInput value={otp} onChange={setOtp} autoFocus />
            </div>

            <button
              type="submit"
              disabled={loading || otp.length < 6}
              className="w-full py-3 px-4 rounded-xl font-bold text-xs uppercase tracking-wider text-thuy-950 bg-gradient-to-r from-thuy-400 to-aqua-400 hover:brightness-110 shadow-glow-cyan transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <span>Xác Nhận</span>
              )}
            </button>
          </form>
        )}

        {step === "two-factor" && (
          <form onSubmit={handleTwoFactor} className="space-y-4">
            <div className="flex items-center gap-2 text-xs text-slate-300">
              <button
                type="button"
                onClick={resetFlow}
                className="inline-flex items-center gap-1 text-thuy-400 hover:underline font-semibold"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Quay lại
              </button>
            </div>

            <div className="space-y-2">
              <label className="text-xs text-slate-300 font-medium block">
                Mã xác thực từ ứng dụng (Google Authenticator / Authy)
              </label>
              <OtpInput value={twoFactorCode} onChange={setTwoFactorCode} autoFocus />
            </div>

            <button
              type="submit"
              disabled={loading || twoFactorCode.length < 6}
              className="w-full py-3 px-4 rounded-xl font-bold text-xs uppercase tracking-wider text-thuy-950 bg-gradient-to-r from-thuy-400 to-aqua-400 hover:brightness-110 shadow-glow-cyan transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <span>Xác Thực</span>
              )}
            </button>
          </form>
        )}

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

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen" />}>
      <LoginForm />
    </Suspense>
  );
}

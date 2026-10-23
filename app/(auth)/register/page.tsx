"use client";

import React, { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  User,
  Lock,
  Mail,
  Loader2,
  AlertCircle,
  Phone,
  ArrowLeft,
} from "lucide-react";
import SocialButtons from "@/components/auth/SocialButtons";
import OtpInput from "@/components/auth/OtpInput";
import { useProviders } from "@/components/auth/useProviders";

const OAUTH_ERRORS: Record<string, string> = {
  oauth_provider: "Nhà cung cấp đăng ký không hợp lệ.",
  oauth_not_configured:
    "Phương thức đăng ký này chưa được cấu hình. Vui lòng liên hệ quản trị viên.",
  oauth_failed: "Đăng ký bằng nhà cung cấp không thành công. Vui lòng thử lại.",
  oauth_missing_profile: "Không lấy được thông tin tài khoản từ nhà cung cấp.",
};

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [mode, setMode] = useState<"phone" | "email">("email");
  const [step, setStep] = useState<"form" | "otp">("form");

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");

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

  const handleRegisterPhone = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setNotice("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/register/phone", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          phone,
          email: email || undefined,
          password: password || undefined,
        }),
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Đăng ký thất bại.");

      setStep("otp");
      setNotice(data.message || "Mã xác minh đã được gửi tới điện thoại của bạn.");
    } catch (err: any) {
      setError(err.message || "Đã có lỗi xảy ra khi đăng ký.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyPhone = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/verify-phone", {
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

  const handleRegisterEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setNotice("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Đăng ký thất bại.");

      setStep("otp");
      setNotice(
        data.message ||
          `Mã xác minh đã được gửi tới ${email}. Vui lòng kiểm tra hộp thư (cả mục Spam).`
      );
    } catch (err: any) {
      setError(err.message || "Đã có lỗi xảy ra khi đăng ký.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/verify-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code: otp }),
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
            Đăng Ký Tài Khoản
          </h2>
          <p className="text-xs text-slate-400">
            Tạo tài khoản để quản lý các file CAD, 3D model và lịch sử mua hàng
          </p>
        </div>

        {error && (
          <div className="p-3.5 rounded-xl bg-red-950/70 border border-red-700 text-red-300 text-xs flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {notice && (
          <div className="p-3.5 rounded-xl bg-aqua-500/10 border border-aqua-500/40 text-aqua-400 text-xs">
            {notice}
          </div>
        )}

        {step === "form" && (
          <>
            <form onSubmit={handleRegisterEmail} className="space-y-4">

              <button
                type="submit"
                disabled={
                  loading ||
                  (mode === "phone" && !providers.loading && !providers.sms)
                }
                className="w-full py-3 px-4 rounded-xl font-bold text-xs uppercase tracking-wider text-thuy-950 bg-gradient-to-r from-thuy-400 to-aqua-400 hover:brightness-110 shadow-glow-cyan transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <span>Đăng Ký</span>
                )}
              </button>
            </form>

            <SocialButtons text="Đăng ký" from={safeFrom} />
          </>
        )}

        {step === "otp" && (
          <form onSubmit={handleVerifyEmail} className="space-y-4">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setStep("form");
                  setOtp("");
                  setError("");
                }}
                className="inline-flex items-center gap-1 text-xs text-thuy-400 hover:underline font-semibold"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Quay lại
              </button>
            </div>

            <div className="space-y-2">
              <label className="text-xs text-slate-300 font-medium block">
                Nhập mã xác minh 6 chữ số đã gửi tới email của bạn
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

        <div className="text-center text-xs text-slate-400">
          Đã có tài khoản?{" "}
          <Link href="/login" className="text-thuy-400 hover:underline font-semibold">
            Đăng nhập
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="min-h-screen" />}>
      <RegisterForm />
    </Suspense>
  );
}

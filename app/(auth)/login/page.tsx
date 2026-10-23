"use client";

import React, { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { AlertCircle } from "lucide-react";
import SocialButtons from "@/components/auth/SocialButtons";

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

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [error, setError] = useState("");

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

  return (
    <div className="min-h-screen flex items-center justify-center py-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-thuy-950 via-thuy-900 to-slate-950" />
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-thuy-500/20 rounded-full blur-3xl" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-aqua-500/20 rounded-full blur-3xl" />

      <div className="max-w-md w-full space-y-8 bg-white/5 border border-white/10 p-8 rounded-3xl shadow-2xl backdrop-blur-xl relative z-10">
        <div className="text-center space-y-2">
          <Link href="/" className="inline-flex items-center gap-2 mb-2">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-thuy-400 to-aqua-400 flex items-center justify-center font-bold text-white shadow-glow-cyan text-lg">
              ACD
            </div>
          </Link>
          <h2 className="font-display font-bold text-2xl text-white">
            Đăng Nhập
          </h2>
          <p className="text-xs text-slate-400">
            Chào mừng bạn quay lại
          </p>
        </div>

        {error && (
          <div className="p-3.5 rounded-xl bg-red-950/70 border border-red-700 text-red-300 text-xs flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <SocialButtons text="Đăng nhập" from={safeFrom} />

        <div className="text-center text-xs text-slate-400">
          Chưa có tài khoản? Đăng nhập bằng Google hoặc Facebook để tạo tài khoản tự động.
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

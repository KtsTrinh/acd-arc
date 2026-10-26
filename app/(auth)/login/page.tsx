"use client";

import React, { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { AlertCircle, ChevronLeft, ShieldCheck, User } from "lucide-react";
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
  admin_required: "Tài khoản này không có quyền quản trị. Vui lòng đăng nhập bằng tài khoản admin.",
  forbidden: "Tài khoản này không có quyền truy cập khu vực này.",
};

type LoginRole = "admin" | "customer" | null;

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [error, setError] = useState("");
  const [selectedRole, setSelectedRole] = useState<LoginRole>(null);

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

  const handleBack = () => {
    setSelectedRole(null);
    setError("");
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-thuy-950 via-thuy-900 to-[#020c1b]" />
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-cyan-400/10 rounded-full blur-3xl" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />

      <div className="max-w-md w-full space-y-8 bg-[#112240]/90 border border-white/10 p-8 rounded-3xl shadow-2xl backdrop-blur-xl relative z-10">
        <div className="text-center space-y-2">
          <Link href="/" className="inline-flex items-center gap-2 mb-2">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-cyan-300 to-blue-500 flex items-center justify-center font-bold text-[#0a192f] shadow-glow-cyan text-lg">
              ACD
            </div>
          </Link>
          <h2 className="font-display font-bold text-2xl text-[#e6f1ff]">
            Đăng Nhập
          </h2>
          <p className="text-xs text-slate-300">
            {selectedRole
              ? "Chọn phương thức đăng nhập"
              : "Chào mừng bạn quay lại"}
          </p>
        </div>

        {error && (
          <div className="p-3.5 rounded-xl bg-red-950/70 border border-red-700 text-red-300 text-xs flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {!selectedRole ? (
          <div className="space-y-3">
            <button
              type="button"
              onClick={() => setSelectedRole("admin")}
              className="w-full flex items-center gap-4 p-4 rounded-2xl bg-[#112240]/80 border border-white/10 hover:border-accent hover:bg-gradient-to-r hover:from-cyan-400/10 hover:to-blue-500/10 transition-all duration-300 ease-out-quart group"
            >
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-300 to-blue-500 flex items-center justify-center shadow-glow-cyan">
                <ShieldCheck className="w-6 h-6 text-[#0a192f]" />
              </div>
              <div className="flex-1 text-left">
                <p className="text-sm font-semibold text-[#e6f1ff] group-hover:text-accent transition-colors duration-300">
                  Quản trị viên
                </p>
                <p className="text-xs text-slate-300">
                  Đăng nhập vào trang quản trị
                </p>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setSelectedRole("customer")}
              className="w-full flex items-center gap-4 p-4 rounded-2xl bg-[#112240]/80 border border-white/10 hover:border-accent hover:bg-gradient-to-r hover:from-cyan-400/10 hover:to-blue-500/10 transition-all duration-300 ease-out-quart group"
            >
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-300 to-blue-500 flex items-center justify-center shadow-glow-cyan">
                <User className="w-6 h-6 text-[#0a192f]" />
              </div>
              <div className="flex-1 text-left">
                <p className="text-sm font-semibold text-[#e6f1ff] group-hover:text-accent transition-colors duration-300">
                  Khách hàng
                </p>
                <p className="text-xs text-slate-300">
                  Đăng nhập để mua hàng và quản lý tài khoản
                </p>
              </div>
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            <button
              type="button"
              onClick={handleBack}
              className="flex items-center gap-2 text-xs text-slate-400 hover:text-accent transition-colors duration-300 ease-out-quart"
            >
              <ChevronLeft className="w-4 h-4" />
              Quay lại chọn loại tài khoản
            </button>

            <div className="space-y-3">
              <div className="text-center">
                <p className="text-sm font-medium text-[#e6f1ff]">
                  {selectedRole === "admin"
                    ? "Đăng nhập dành cho Quản trị viên"
                    : "Đăng nhập dành cho Khách hàng"}
                </p>
                <p className="text-xs text-slate-300 mt-1">
                  Sử dụng tài khoản Google hoặc Facebook
                </p>
              </div>
              <SocialButtons
                text="Đăng nhập"
                from={selectedRole === "admin" ? "/admin" : "/account"}
              />
            </div>
          </div>
        )}

        <div className="text-center text-xs text-slate-300 space-y-1">
          <p>Chưa có tài khoản?</p>
          <p>Đăng nhập bằng Google hoặc Facebook để tạo tài khoản tự động.</p>
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

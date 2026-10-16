import React from "react";
import AdminSidebar from "@/components/admin/AdminSidebar";
import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";

export const revalidate = 0;

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  // If not logged in or not admin, redirect to login
  if (!user || user.role !== "ADMIN") {
    redirect("/login?error=admin_required");
  }

  return (
    <div className="flex min-h-screen bg-thuy-900 text-slate-100">
      <AdminSidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 border-b border-thuy-750 bg-thuy-950/80 px-8 flex items-center justify-between sticky top-0 z-30 backdrop-blur-md">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs text-slate-300 font-medium">Hệ Thống Trực Tuyến ACD Studio</span>
          </div>

          <div className="flex items-center gap-3 text-xs">
            <span className="text-slate-400">Đang quản trị:</span>
            <span className="font-semibold text-white px-2.5 py-1 rounded-lg bg-thuy-850 border border-thuy-700">
              {user.name} ({user.email})
            </span>
          </div>
        </header>

        <main className="flex-1 p-6 sm:p-8 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}


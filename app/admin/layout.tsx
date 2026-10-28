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
  if (!user || (user.role !== "ADMIN" && user.role !== "SUPER_ADMIN")) {
    redirect("/login?error=admin_required");
  }

  return (
    <div
      className="flex min-h-screen"
      style={{ backgroundColor: "var(--admin-background, #F3F8FC)" }}
    >
      <AdminSidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <header
          className="h-16 border-b px-6 sm:px-8 flex items-center justify-between sticky top-0 z-30 backdrop-blur-xl"
          style={{
            backgroundColor: "rgba(255,255,255,0.9)",
            borderColor: "var(--admin-border, #E1EAF2)",
          }}
        >
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span
              className="text-sm"
              style={{ color: "var(--admin-text-secondary, #526780)" }}
            >
              Hệ Thống Trực Tuyến ACD Studio
            </span>
          </div>

          <div className="flex items-center gap-3 text-sm">
            <span style={{ color: "var(--admin-text-muted, #8192A8)" }}>
              Đang quản trị:
            </span>
            <span
              className="font-medium px-3 py-1.5 rounded-lg border shadow-sm"
              style={{
                color: "var(--admin-text-primary, #142338)",
                backgroundColor: "var(--admin-surface, #FFFFFF)",
                borderColor: "var(--admin-border, #E1EAF2)",
              }}
            >
              {user.name} ({user.email})
            </span>
          </div>
        </header>

        <main className="flex-1 p-6 sm:p-8 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}

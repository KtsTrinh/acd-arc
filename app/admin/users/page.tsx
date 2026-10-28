"use client";

import React, { useState, useEffect } from "react";
import { formatDateTime } from "@/lib/utils";
import { Users, Shield, User, Loader2 } from "lucide-react";

export default function AdminUsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const fetchUsers = async () => {
    try {
      const res = await fetch("/api/users");
      const data = await res.json();
      if (data.users) setUsers(data.users);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleToggleRole = async (userId: string, currentRole: string) => {
    const newRole = currentRole === "ADMIN" ? "USER" : "ADMIN";
    setUpdatingId(userId);
    try {
      const res = await fetch("/api/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: userId, role: newRole }),
      });
      const data = await res.json();
      if (data.user) fetchUsers();
    } catch (err) {
      console.error(err);
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h1 className="font-display font-bold text-2xl sm:text-3xl text-[#142338]">
          Quản Lý Tài Khoản & Phân Quyền
        </h1>
        <p className="text-xs text-slate-600">
          Danh sách khách hàng và quản trị viên hệ thống ACD Studio
        </p>
      </div>

      <div className="rounded-2xl bg-thuy-850 border border-thuy-750 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-thuy-900/80 text-white uppercase font-semibold text-[10px] tracking-wider border-b border-thuy-750">
              <tr>
                <th className="py-3 px-5">Tài Khoản</th>
                <th className="py-3 px-5">Email</th>
                <th className="py-3 px-5">Vai Trò (Role)</th>
                <th className="py-3 px-5">Số Đơn Hàng</th>
                <th className="py-3 px-5">Ngày Tạo</th>
                <th className="py-3 px-5 text-right">Phân Quyền</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-thuy-750/60">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-thuy-800/40">
                  <td className="py-3.5 px-5">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-thuy-750 flex items-center justify-center font-bold text-black text-xs">
                        {u.name ? u.name[0].toUpperCase() : "U"}
                      </div>
                      <span className="font-semibold text-black">
                        {u.name || "Chưa đặt tên"}
                      </span>
                    </div>
                  </td>
                  <td className="py-3.5 px-5 font-mono text-black">
                    {u.email}
                  </td>
                  <td className="py-3.5 px-5">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        u.role === "ADMIN"
                          ? "bg-thuy-500/20 text-white border border-thuy-500/40"
                          : "bg-slate-800 text-white border border-slate-700"
                      }`}
                    >
                      {u.role === "ADMIN" ? (
                        <Shield className="w-3 h-3 text-thuy-400" />
                      ) : (
                        <User className="w-3 h-3" />
                      )}
                      <span>{u.role}</span>
                    </span>
                  </td>
                  <td className="py-3.5 px-5 font-semibold text-thuy-400">
                    {u._count?.orders || 0} đơn
                  </td>
                  <td className="py-3.5 px-5 text-slate-600">
                    {formatDateTime(u.createdAt)}
                  </td>
                  <td className="py-3.5 px-5 text-right">
                    <button
                      onClick={() => handleToggleRole(u.id, u.role)}
                      disabled={updatingId === u.id}
                      className="px-3 py-1 rounded-lg bg-thuy-800 hover:bg-thuy-700 text-xs font-medium text-slate-200 border border-thuy-700"
                    >
                      {updatingId === u.id
                        ? "Đang cập nhật..."
                        : u.role === "ADMIN"
                          ? "Hạ xuống USER"
                          : "Nâng lên ADMIN"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

"use client";

import React, { useState, useEffect } from "react";
import { formatDateTime } from "@/lib/utils";
import { Users, Shield, User, Plus, X, Trash2 } from "lucide-react";

export default function AdminUsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", role: "ADMIN" });
  const [creating, setCreating] = useState(false);

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
    fetch("/api/auth/me").then(r=>r.json()).then(d=>{if(d.user) setCurrentUser(d.user);});
  }, []);

  const handleTransfer = async (userId: string) => {
    if (!confirm("Chuyển nhượng toàn quyền Super Admin cho tài khoản này? Tài khoản hiện tại của bạn sẽ bị hạ xuống Admin.")) return;
    setUpdatingId(userId);
    try {
      const res = await fetch("/api/users", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: userId, role: "SUPER_ADMIN" }) });
      if (res.ok) {
        await fetch("/api/users", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: currentUser.id, role: "ADMIN" }) });
        window.location.reload();
        return;
      } else {
        const d = await res.json();
        alert(d.error || "Không thể chuyển nhượng quyền");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleToggleRole = async (userId: string, currentRole: string) => {
    const newRole = currentRole === "ADMIN" ? "USER" : "ADMIN";
    setUpdatingId(userId);
    try {
      const res = await fetch("/api/users", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: userId, role: newRole }) });
      const data = await res.json();
      if (data.user) fetchUsers();
      else if (data.error) alert(data.error);
    } catch (err) {
      console.error(err);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDelete = async (userId: string, userName: string) => {
    if (!confirm(`Xóa tài khoản "${userName}"? Hành động này không thể hoàn tác.`)) return;
    setUpdatingId(userId);
    try {
      const res = await fetch(`/api/users?id=${userId}`, { method: "DELETE" });
      const data = await res.json();
      if (res.ok && data.success) {
        fetchUsers();
      } else {
        alert(data.error || "Không thể xóa tài khoản");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email) return alert("Vui lòng nhập đầy đủ thông tin");
    setCreating(true);
    try {
      const res = await fetch("/api/users", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
      const data = await res.json();
      if (data.success) {
        setShowCreate(false);
        setForm({ name: "", email: "", role: "ADMIN" });
        fetchUsers();
      } else {
        alert(data.error || "Không thể tạo tài khoản");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setCreating(false);
    }
  };

  const adminUsers = users.filter(u => u.role === "SUPER_ADMIN" || u.role === "ADMIN");
  const normalUsers = users.filter(u => u.role === "USER");

  return (
    <div className="space-y-8 max-w-6xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display font-bold text-2xl sm:text-3xl text-[#142338]">Quản Lý Tài Khoản</h1>
          <p className="text-sm text-[#526780] mt-1">Phân quyền và quản lý người dùng hệ thống</p>
        </div>
        {currentUser?.role === "SUPER_ADMIN" && (
          <button onClick={() => setShowCreate(true)} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-[#087EA4] to-[#22C7E8] text-white text-sm font-medium">
            <Plus className="w-4 h-4" /> Thêm tài khoản
          </button>
        )}
      </div>

      {showCreate && currentUser?.role === "SUPER_ADMIN" && (
        <div className="rounded-xl bg-white border border-[#E1EAF2] p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-[#142338]">Thêm tài khoản</h2>
            <button onClick={() => setShowCreate(false)} className="p-1 hover:bg-[#F7FAFD] rounded-lg"><X className="w-4 h-4 text-[#526780]" /></button>
          </div>
          <form onSubmit={handleCreate} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <input className="px-3 py-2 rounded-lg border border-[#E1EAF2] text-sm text-[#142338]" placeholder="Họ tên" value={form.name} onChange={e=>setForm({...form,name:e.target.value})} />
            <input className="px-3 py-2 rounded-lg border border-[#E1EAF2] text-sm text-[#142338]" placeholder="Email" type="email" value={form.email} onChange={e=>setForm({...form,email:e.target.value})} />
            <select className="px-3 py-2 rounded-lg border border-[#E1EAF2] text-sm text-[#142338]" value={form.role} onChange={e=>setForm({...form,role:e.target.value})}>
              <option value="ADMIN">ADMIN</option>
              <option value="USER">USER</option>
            </select>
            <button disabled={creating} className="px-4 py-2 rounded-lg bg-[#087EA4] text-white text-sm font-medium">{creating?"Đang tạo...":"Tạo tài khoản"}</button>
          </form>
        </div>
      )}

      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-[#142338]">Tài khoản Quản trị</h2>
        <div className="rounded-xl bg-white border border-[#E1EAF2] overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-[#F7FAFD] text-[#526780] uppercase font-medium text-[11px] tracking-wider border-b border-[#E1EAF2]">
                <tr>
                  <th className="py-3 px-5">Tài Khoản</th>
                  <th className="py-3 px-5">Email</th>
                  <th className="py-3 px-5">Vai Trò</th>
                  <th className="py-3 px-5">Ngày Tạo</th>
                  <th className="py-3 px-5 text-right">Thao Tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E1EAF2]">
                {adminUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-[#F7FAFD]">
                    <td className="py-3.5 px-5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-[#E8FAFE] flex items-center justify-center font-semibold text-[#087EA4] text-xs">
                          {u.name ? u.name[0].toUpperCase() : "U"}
                        </div>
                        <span className="font-medium text-[#142338]">{u.name || "Chưa đặt tên"}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-5 text-[#526780]">{u.email}</td>
                    <td className="py-3.5 px-5">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${u.role === "SUPER_ADMIN" ? "bg-[#E8FAFE] text-[#087EA4] border-[#22C7E8]/30" : "bg-blue-50 text-blue-700 border-blue-200"}`}>
                        {u.role === "SUPER_ADMIN" ? <Shield className="w-3.5 h-3.5" /> : <User className="w-3.5 h-3.5" />}
                        <span>{u.role}</span>
                      </span>
                    </td>
                    <td className="py-3.5 px-5 text-[#526780]">{formatDateTime(u.createdAt)}</td>
                    <td className="py-3.5 px-5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {currentUser?.role === "SUPER_ADMIN" && u.role === "ADMIN" && (
                          <button onClick={() => handleToggleRole(u.id, u.role)} disabled={updatingId === u.id} className="px-2.5 py-1 rounded-lg bg-white border border-[#E1EAF2] text-xs text-[#142338] hover:border-[#22C7E8]">
                            Hạ xuống USER
                          </button>
                        )}
                        {currentUser?.role === "SUPER_ADMIN" && u.role === "ADMIN" && (
                          <button onClick={() => handleTransfer(u.id)} disabled={updatingId === u.id} className="px-2.5 py-1 rounded-lg bg-white border border-[#E1EAF2] text-xs text-[#142338] hover:border-[#22C7E8]">
                            Chuyển nhượng quyền
                          </button>
                        )}
                        {currentUser?.role === "SUPER_ADMIN" && u.role !== "SUPER_ADMIN" && (
                          <button onClick={() => handleDelete(u.id, u.name || u.email)} disabled={updatingId === u.id} className="p-1.5 rounded-lg hover:bg-red-50 text-red-500">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-[#142338]">Tài khoản Người dùng</h2>
        <div className="rounded-xl bg-white border border-[#E1EAF2] overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-[#F7FAFD] text-[#526780] uppercase font-medium text-[11px] tracking-wider border-b border-[#E1EAF2]">
                <tr>
                  <th className="py-3 px-5">Tài Khoản</th>
                  <th className="py-3 px-5">Email</th>
                  <th className="py-3 px-5">Vai Trò</th>
                  <th className="py-3 px-5">Ngày Tạo</th>
                  <th className="py-3 px-5 text-right">Thao Tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E1EAF2]">
                {normalUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-[#F7FAFD]">
                    <td className="py-3.5 px-5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center font-semibold text-slate-600 text-xs">
                          {u.name ? u.name[0].toUpperCase() : "U"}
                        </div>
                        <span className="font-medium text-[#142338]">{u.name || "Chưa đặt tên"}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-5 text-[#526780]">{u.email}</td>
                    <td className="py-3.5 px-5">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border bg-slate-50 text-slate-700 border-slate-200">
                        <User className="w-3.5 h-3.5" />
                        <span>{u.role}</span>
                      </span>
                    </td>
                    <td className="py-3.5 px-5 text-[#526780]">{formatDateTime(u.createdAt)}</td>
                    <td className="py-3.5 px-5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {currentUser?.role === "SUPER_ADMIN" && (
                          <button onClick={() => handleToggleRole(u.id, u.role)} disabled={updatingId === u.id} className="px-2.5 py-1 rounded-lg bg-white border border-[#E1EAF2] text-xs text-[#142338] hover:border-[#22C7E8]">
                            Nâng lên ADMIN
                          </button>
                        )}
                        {(currentUser?.role === "SUPER_ADMIN" || currentUser?.role === "ADMIN") && (
                          <button onClick={() => handleDelete(u.id, u.name || u.email)} disabled={updatingId === u.id} className="p-1.5 rounded-lg hover:bg-red-50 text-red-500">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

"use client";

import React, { useState, useEffect } from "react";
import { formatDateTime } from "@/lib/utils";
import { Users, Shield, User, Loader2, Plus, X } from "lucide-react";

export default function AdminUsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "ADMIN" });
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

  const handleToggleRole = async (userId: string, currentRole: string) => {
    if (currentUser?.role === "SUPER_ADMIN" && currentRole !== "SUPER_ADMIN") {
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
      return;
    }
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

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.password) return alert("Vui lòng nhập đầy đủ thông tin");
    setCreating(true);
    try {
      const res = await fetch("/api/users", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
      const data = await res.json();
      if (data.success) {
        setShowCreate(false);
        setForm({ name: "", email: "", password: "", role: "ADMIN" });
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

  const sortedUsers = [...users].sort((a,b) => {
    const order = { SUPER_ADMIN: 0, ADMIN: 1, USER: 2 } as any;
    const oa = order[a.role] ?? 99;
    const ob = order[b.role] ?? 99;
    if (oa !== ob) return oa - ob;
    return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
  });

  return (
    <div className="space-y-6 max-w-6xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display font-bold text-2xl sm:text-3xl text-[#142338]">Quản Lý Tài Khoản & Phân Quyền</h1>
          <p className="text-sm text-[#526780] mt-1">Danh sách người dùng và phân quyền hệ thống ACD Studio</p>
        </div>
        {currentUser?.role === "SUPER_ADMIN" && (
          <button onClick={() => setShowCreate(true)} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-[#087EA4] to-[#22C7E8] text-white text-sm font-medium">
            <Plus className="w-4 h-4" /> Thêm tài khoản Admin
          </button>
        )}
      </div>

      {showCreate && currentUser?.role === "SUPER_ADMIN" && (
        <div className="rounded-xl bg-white border border-[#E1EAF2] p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-[#142338]">Thêm tài khoản mới</h2>
            <button onClick={() => setShowCreate(false)} className="p-1 hover:bg-[#F7FAFD] rounded-lg"><X className="w-4 h-4 text-[#526780]" /></button>
          </div>
          <form onSubmit={handleCreate} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            <input className="px-3 py-2 rounded-lg border border-[#E1EAF2] text-sm text-[#142338]" placeholder="Họ tên" value={form.name} onChange={e=>setForm({...form,name:e.target.value})} />
            <input className="px-3 py-2 rounded-lg border border-[#E1EAF2] text-sm text-[#142338]" placeholder="Email" type="email" value={form.email} onChange={e=>setForm({...form,email:e.target.value})} />
            <input className="px-3 py-2 rounded-lg border border-[#E1EAF2] text-sm text-[#142338]" placeholder="Mật khẩu" type="password" value={form.password} onChange={e=>setForm({...form,password:e.target.value})} />
            <select className="px-3 py-2 rounded-lg border border-[#E1EAF2] text-sm text-[#142338]" value={form.role} onChange={e=>setForm({...form,role:e.target.value})}>
              <option value="ADMIN">ADMIN</option>
              <option value="USER">USER</option>
            </select>
            <button disabled={creating} className="px-4 py-2 rounded-lg bg-[#087EA4] text-white text-sm font-medium">{creating?"Đang tạo...":"Tạo tài khoản"}</button>
          </form>
        </div>
      )}

      <div className="rounded-xl bg-white border border-[#E1EAF2] overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-[#F7FAFD] text-[#526780] uppercase font-medium text-[11px] tracking-wider border-b border-[#E1EAF2]">
              <tr>
                <th className="py-3 px-5">Tài Khoản</th>
                <th className="py-3 px-5">Email</th>
                <th className="py-3 px-5">Vai Trò</th>
                <th className="py-3 px-5">Ngày Tạo</th>
                {currentUser?.role === "SUPER_ADMIN" && <th className="py-3 px-5 text-right">Phân Quyền</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E1EAF2]">
              {sortedUsers.map((u) => (
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
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${u.role === "SUPER_ADMIN" ? "bg-[#E8FAFE] text-[#087EA4] border-[#22C7E8]/30" : u.role === "ADMIN" ? "bg-blue-50 text-blue-700 border-blue-200" : "bg-slate-50 text-slate-700 border-slate-200"}`}>
                      {u.role === "SUPER_ADMIN" ? <Shield className="w-3.5 h-3.5" /> : <User className="w-3.5 h-3.5" />}
                      <span>{u.role}</span>
                    </span>
                  </td>
                  <td className="py-3.5 px-5 text-[#526780]">{formatDateTime(u.createdAt)}</td>
                  {currentUser?.role === "SUPER_ADMIN" && (
                    <td className="py-3.5 px-5 text-right">
                      {u.role === "SUPER_ADMIN" ? (
                        currentUser?.id !== u.id ? (
                          <button onClick={() => handleToggleRole(u.id, u.role)} disabled={updatingId === u.id} className="px-3 py-1.5 rounded-lg bg-white border border-[#E1EAF2] text-xs font-medium text-[#142338] hover:border-[#22C7E8]">
                            {updatingId === u.id ? "Đang xử lý..." : "Chuyển nhượng quyền"}
                          </button>
                        ) : (
                          <span className="text-xs text-[#8192A8]">Tài khoản cao nhất</span>
                        )
                      ) : (
                        <button onClick={() => handleToggleRole(u.id, u.role)} disabled={updatingId === u.id} className="px-3 py-1.5 rounded-lg bg-white border border-[#E1EAF2] text-xs font-medium text-[#142338] hover:border-[#22C7E8]">
                          {updatingId === u.id ? "Đang cập nhật..." : u.role === "ADMIN" ? "Hạ xuống USER" : "Nâng lên ADMIN"}
                        </button>
                      )}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

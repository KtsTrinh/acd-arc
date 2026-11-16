"use client";

import React, { useEffect, useState } from "react";
import { formatDateTime } from "@/lib/utils";
import { AlertCircle, CheckCircle2, Plus, Shield, Trash2, User, X } from "lucide-react";

type Notice = { type: "ok" | "err"; text: string } | null;
type ConfirmModal =
  | { type: "delete"; id: string; name: string }
  | { type: "transfer"; id: string; name: string }
  | null;

export default function AdminUsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", role: "ADMIN" });
  const [creating, setCreating] = useState(false);
  const [notice, setNotice] = useState<Notice>(null);
  const [confirmModal, setConfirmModal] = useState<ConfirmModal>(null);

  useEffect(() => {
    if (!notice) return;
    const t = setTimeout(() => setNotice(null), 3500);
    return () => clearTimeout(t);
  }, [notice]);

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
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((d) => {
        if (d.user) setCurrentUser(d.user);
      });
  }, []);

  const handleTransfer = async (userId: string) => {
    setConfirmModal(null);
    setUpdatingId(userId);
    try {
      const res = await fetch("/api/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: userId, role: "SUPER_ADMIN" }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setNotice({
          type: "ok",
          text:
            data.message ||
            "Chuyển nhượng quyền thành công. Hệ thống sẽ đăng xuất để cập nhật quyền.",
        });

        setTimeout(() => {
          const cookiesToClear = [
            "token",
            "session",
            "auth-token",
            "accessToken",
            "next-auth.session-token",
          ];
          cookiesToClear.forEach((name) => {
            document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=${window.location.hostname};`;
            document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
          });
          localStorage.clear();
          sessionStorage.clear();
          window.location.href = "/login";
        }, 1200);
        return;
      } else {
        setNotice({ type: "err", text: data.error || "Không thể chuyển nhượng quyền" });
      }
    } catch (err) {
      console.error(err);
      setNotice({ type: "err", text: "Không thể chuyển nhượng quyền" });
    } finally {
      setUpdatingId(null);
    }
  };

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
      if (data.user) {
        fetchUsers();
        setNotice({ type: "ok", text: "Đã cập nhật vai trò tài khoản." });
      } else if (data.error) {
        setNotice({ type: "err", text: data.error });
      }
    } catch (err) {
      console.error(err);
      setNotice({ type: "err", text: "Không thể cập nhật vai trò." });
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDelete = async (userId: string) => {
    setConfirmModal(null);
    setUpdatingId(userId);
    try {
      const res = await fetch(`/api/users?id=${userId}`, { method: "DELETE" });
      const data = await res.json();
      if (res.ok && data.success) {
        fetchUsers();
        setNotice({ type: "ok", text: "Đã xóa tài khoản." });
      } else {
        setNotice({ type: "err", text: data.error || "Không thể xóa tài khoản" });
      }
    } catch (err) {
      console.error(err);
      setNotice({ type: "err", text: "Không thể xóa tài khoản" });
    } finally {
      setUpdatingId(null);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email) {
      setNotice({ type: "err", text: "Vui lòng nhập đầy đủ thông tin" });
      return;
    }
    setCreating(true);
    try {
      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (data.success) {
        setShowCreate(false);
        setForm({ name: "", email: "", role: "ADMIN" });
        fetchUsers();
        setNotice({ type: "ok", text: "Đã tạo tài khoản." });
      } else {
        setNotice({ type: "err", text: data.error || "Không thể tạo tài khoản" });
      }
    } catch (err) {
      console.error(err);
      setNotice({ type: "err", text: "Không thể tạo tài khoản" });
    } finally {
      setCreating(false);
    }
  };

  const adminUsers = users.filter(
    (u) => u.role === "SUPER_ADMIN" || u.role === "ADMIN",
  );
  const normalUsers = users.filter((u) => u.role === "USER");

  return (
    <div className="space-y-8 max-w-6xl">
      {notice && (
        <div className="fixed top-4 right-4 z-[120] animate-in fade-in slide-in-from-top-2 duration-300">
          <div
            className={`flex items-start gap-3 min-w-[280px] max-w-md px-4 py-3 rounded-xl border shadow-lg backdrop-blur-sm ${
              notice.type === "ok"
                ? "bg-emerald-50/95 border-emerald-200 text-emerald-800"
                : "bg-red-50/95 border-red-200 text-red-700"
            }`}
          >
            {notice.type === "ok" ? (
              <CheckCircle2 className="w-5 h-5 mt-0.5 flex-shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
            )}
            <p className="text-sm font-medium flex-1">{notice.text}</p>
            <button
              type="button"
              onClick={() => setNotice(null)}
              className="text-current/60 hover:text-current transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display font-bold text-2xl sm:text-3xl text-[#142338]">
            Quản Lý Tài Khoản
          </h1>
          <p className="text-sm text-[#526780] mt-1">
            Phân quyền và quản lý người dùng hệ thống
          </p>
        </div>
        {currentUser?.role === "SUPER_ADMIN" && (
          <button
            onClick={() => setShowCreate(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-[#087EA4] to-[#22C7E8] text-white text-sm font-medium"
          >
            <Plus className="w-4 h-4" /> Thêm tài khoản
          </button>
        )}
      </div>

      {showCreate && currentUser?.role === "SUPER_ADMIN" && (
        <div className="rounded-xl bg-white border border-[#E1EAF2] p-5 shadow-sm animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-[#142338]">
              Thêm tài khoản
            </h2>
            <button
              onClick={() => setShowCreate(false)}
              className="p-1 hover:bg-[#F7FAFD] rounded-lg"
            >
              <X className="w-4 h-4 text-[#526780]" />
            </button>
          </div>
          <form
            onSubmit={handleCreate}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3"
          >
            <input
              className="px-3 py-2 rounded-lg border border-[#E1EAF2] text-sm text-[#142338]"
              placeholder="Họ tên"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
            <input
              className="px-3 py-2 rounded-lg border border-[#E1EAF2] text-sm text-[#142338]"
              placeholder="Email"
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
            <select
              className="px-3 py-2 rounded-lg border border-[#E1EAF2] text-sm text-[#142338]"
              value={form.role}
              onChange={(e) => setForm({ ...form, role: e.target.value })}
            >
              <option value="ADMIN">ADMIN</option>
              <option value="USER">USER</option>
            </select>
            <button
              disabled={creating}
              className="px-4 py-2 rounded-lg bg-[#087EA4] text-white text-sm font-medium"
            >
              {creating ? "Đang tạo..." : "Tạo tài khoản"}
            </button>
          </form>
        </div>
      )}

      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-[#142338]">
          Tài khoản Quản trị
        </h2>
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
                        <span className="font-medium text-[#142338]">
                          {u.name || "Chưa đặt tên"}
                        </span>
                      </div>
                    </td>
                    <td className="py-3.5 px-5 text-[#526780]">{u.email}</td>
                    <td className="py-3.5 px-5">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${u.role === "SUPER_ADMIN" ? "bg-[#E8FAFE] text-[#087EA4] border-[#22C7E8]/30" : "bg-blue-50 text-blue-700 border-blue-200"}`}
                      >
                        {u.role === "SUPER_ADMIN" ? (
                          <Shield className="w-3.5 h-3.5" />
                        ) : (
                          <User className="w-3.5 h-3.5" />
                        )}
                        <span>{u.role}</span>
                      </span>
                    </td>
                    <td className="py-3.5 px-5 text-[#526780]">
                      {formatDateTime(u.createdAt)}
                    </td>
                    <td className="py-3.5 px-5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {currentUser?.role === "SUPER_ADMIN" &&
                          u.role === "ADMIN" && (
                            <button
                              onClick={() => handleToggleRole(u.id, u.role)}
                              disabled={updatingId === u.id}
                              className="px-2.5 py-1 rounded-lg bg-white border border-[#E1EAF2] text-xs text-[#142338] hover:border-[#22C7E8]"
                            >
                              Hạ xuống USER
                            </button>
                          )}
                        {currentUser?.role === "SUPER_ADMIN" &&
                          u.role === "ADMIN" && (
                            <button
                              onClick={() =>
                                setConfirmModal({
                                  type: "transfer",
                                  id: u.id,
                                  name: u.name || u.email,
                                })
                              }
                              disabled={updatingId === u.id}
                              className="px-2.5 py-1 rounded-lg bg-white border border-[#E1EAF2] text-xs text-[#142338] hover:border-[#22C7E8]"
                            >
                              Chuyển nhượng quyền
                            </button>
                          )}
                        {currentUser?.role === "SUPER_ADMIN" &&
                          u.role !== "SUPER_ADMIN" && (
                            <button
                              onClick={() =>
                                setConfirmModal({
                                  type: "delete",
                                  id: u.id,
                                  name: u.name || u.email,
                                })
                              }
                              disabled={updatingId === u.id}
                              className="p-1.5 rounded-lg hover:bg-red-50 text-red-500"
                            >
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
        <h2 className="text-lg font-semibold text-[#142338]">
          Tài khoản Người dùng
        </h2>
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
                        <span className="font-medium text-[#142338]">
                          {u.name || "Chưa đặt tên"}
                        </span>
                      </div>
                    </td>
                    <td className="py-3.5 px-5 text-[#526780]">{u.email}</td>
                    <td className="py-3.5 px-5">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border bg-slate-50 text-slate-700 border-slate-200">
                        <User className="w-3.5 h-3.5" />
                        <span>{u.role}</span>
                      </span>
                    </td>
                    <td className="py-3.5 px-5 text-[#526780]">
                      {formatDateTime(u.createdAt)}
                    </td>
                    <td className="py-3.5 px-5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {currentUser?.role === "SUPER_ADMIN" && (
                          <button
                            onClick={() => handleToggleRole(u.id, u.role)}
                            disabled={updatingId === u.id}
                            className="px-2.5 py-1 rounded-lg bg-white border border-[#E1EAF2] text-xs text-[#142338] hover:border-[#22C7E8]"
                          >
                            Nâng lên ADMIN
                          </button>
                        )}
                        {(currentUser?.role === "SUPER_ADMIN" ||
                          currentUser?.role === "ADMIN") && (
                          <button
                            onClick={() =>
                              setConfirmModal({
                                type: "delete",
                                id: u.id,
                                name: u.name || u.email,
                              })
                            }
                            disabled={updatingId === u.id}
                            className="p-1.5 rounded-lg hover:bg-red-50 text-red-500"
                          >
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

      {confirmModal && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center">
          <div
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200"
            onClick={() => setConfirmModal(null)}
          />
          <div className="relative w-full max-w-md mx-4 animate-in fade-in zoom-in-95 slide-in-from-bottom-2 duration-200">
            <div className="rounded-2xl border border-[#E1EAF2] bg-white p-6 shadow-2xl">
              <div className="flex items-start gap-4">
                <div
                  className={`flex-shrink-0 w-12 h-12 rounded-2xl flex items-center justify-center border ${
                    confirmModal.type === "transfer"
                      ? "bg-amber-50 border-amber-200 text-amber-600"
                      : "bg-red-50 border-red-200 text-red-500"
                  }`}
                >
                  {confirmModal.type === "transfer" ? (
                    <Shield className="w-6 h-6" />
                  ) : (
                    <Trash2 className="w-6 h-6" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="text-[#142338] font-semibold text-base">
                    {confirmModal.type === "transfer"
                      ? "Chuyển nhượng quyền Super Admin?"
                      : "Xóa tài khoản?"}
                  </h3>
                  <p className="text-[#526780] text-sm mt-1.5 leading-relaxed">
                    {confirmModal.type === "transfer" ? (
                      <>
                        Chuyển toàn quyền Super Admin cho{" "}
                        <b className="text-[#142338]">{confirmModal.name}</b>? Tài khoản
                        hiện tại của bạn sẽ bị hạ xuống User và hệ thống sẽ đăng xuất.
                      </>
                    ) : (
                      <>
                        Bạn có chắc muốn xóa tài khoản{" "}
                        <b className="text-[#142338]">{confirmModal.name}</b>? Hành động
                        này không thể hoàn tác.
                      </>
                    )}
                  </p>
                </div>
              </div>
              <div className="mt-6 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setConfirmModal(null)}
                  className="px-4 py-2.5 rounded-xl text-sm font-semibold text-[#526780] bg-[#F7FAFD] hover:bg-[#E1EAF2] border border-[#E1EAF2] transition-all"
                >
                  Hủy
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (confirmModal.type === "transfer") handleTransfer(confirmModal.id);
                    else handleDelete(confirmModal.id);
                  }}
                  disabled={updatingId === confirmModal.id}
                  className={`px-4 py-2.5 rounded-xl text-sm font-semibold text-white transition-all flex items-center gap-2 disabled:opacity-60 ${
                    confirmModal.type === "transfer"
                      ? "bg-gradient-to-r from-amber-500 to-orange-500 hover:brightness-110 shadow-lg shadow-amber-200"
                      : "bg-gradient-to-r from-red-500 to-rose-500 hover:brightness-110 shadow-lg shadow-red-200"
                  }`}
                >
                  {confirmModal.type === "transfer" ? (
                    <Shield className="w-4 h-4" />
                  ) : (
                    <Trash2 className="w-4 h-4" />
                  )}
                  {confirmModal.type === "transfer" ? "Chuyển nhượng" : "Xóa tài khoản"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

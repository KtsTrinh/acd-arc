"use client";

import React, { useState, useEffect } from "react";
import { CreditCard, Save, Loader2, CheckCircle2, AlertTriangle, Link2, ShieldCheck } from "lucide-react";

const inputCls =
  "w-full px-3.5 py-2.5 rounded-xl bg-thuy-900 border border-thuy-700 text-xs text-white focus:outline-none focus:border-thuy-400 transition-colors";
const labelCls = "block text-xs text-slate-700 font-medium mb-1.5";

const bankList = [
  { code: "VCB", shortName: "Vietcombank" },
  { code: "ACB", shortName: "ACB" },
  { code: "TCB", shortName: "Techcombank" },
  { code: "MB", shortName: "MB" },
  { code: "VTB", shortName: "VietinBank" },
  { code: "BIDV", shortName: "BIDV" },
  { code: "VPB", shortName: "VPBank" },
  { code: "TPB", shortName: "TPBank" },
  { code: "STB", shortName: "Sacombank" },
  { code: "HDB", shortName: "HDBank" },
  { code: "SHB", shortName: "SHB" },
  { code: "VIB", shortName: "VIB" },
  { code: "MSB", shortName: "MSB" },
  { code: "OCB", shortName: "OCB" },
  { code: "SCB", shortName: "SCB" },
  { code: "EIB", shortName: "Eximbank" },
  { code: "ABB", shortName: "ABBANK" },
];

const generateBankQr = (account: string, bankName: string, accountName: string) => {
  if (!account || !bankName) return "";
  const name = bankName.toLowerCase().trim();
  const bank = bankList.find(
    (b) =>
      name === b.code.toLowerCase() ||
      name === b.shortName.toLowerCase() ||
      name.includes(b.shortName.toLowerCase()) ||
      b.shortName.toLowerCase().includes(name),
  );
  const bankCode = bank?.code || "";
  if (!bankCode) return "";
  const sep = String.fromCharCode(38);
  return "https://img.vietqr.io/image/" + bankCode + "-" + encodeURIComponent(account.trim()) + "-compact2.png?amount=0" + sep + "addInfo=" + encodeURIComponent("Thanh toan") + sep + "accountName=" + encodeURIComponent(accountName || "");
};

export default function AdminPaymentSettingsPage() {
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [message, setMessage] = useState<{ type: "ok" | "err"; text: string } | null>(null);
  const [webhookUrl, setWebhookUrl] = useState("");

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((data) => {
        if (data.user?.role === "SUPER_ADMIN") {
          setIsSuperAdmin(true);
        }
      })
      .catch(() => { })
      .finally(() => setCheckingAuth(false));
  }, []);

  useEffect(() => {
    fetch("/api/settings")
      .then((r) => r.json())
      .then((data) => {
        if (data.settings) setSettings(data.settings);
      })
      .catch(() => setMessage({ type: "err", text: "Không tải được cấu hình." }))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setWebhookUrl(`${window.location.origin}/api/payments/webhook`);
    }
  }, []);

  const update = (key: string, value: string) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isSuperAdmin) return;
    setSaving(true);
    setMessage(null);
    try {
      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ settings }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Lỗi lưu cấu hình.");
      if (data.settings) setSettings(data.settings);
      setMessage({ type: "ok", text: "Đã lưu cấu hình tài khoản thanh toán thành công." });
    } catch (err: any) {
      setMessage({ type: "err", text: err.message || "Đã xảy ra lỗi." });
    } finally {
      setSaving(false);
    }
  };

  if (checkingAuth || loading) {
    return (
      <div className="flex items-center justify-center py-24 gap-3 text-slate-600 text-xs">
        <Loader2 className="w-4 h-4 animate-spin" />
        <span>Đang tải cấu hình tài khoản thanh toán...</span>
      </div>
    );
  }

  if (!isSuperAdmin) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-3 text-slate-600">
        <AlertTriangle className="w-6 h-6 text-red-400" />
        <p className="text-sm">Chỉ tài khoản Super Admin mới có quyền truy cập trang này.</p>
      </div>
    );
  }

  const qrPreview = generateBankQr(
    settings.bankAccount || "",
    settings.bankName || "",
    settings.bankAccountName || ""
  );

  return (
    <form onSubmit={handleSave} className="space-y-6 max-w-4xl">
      <div>
        <h1 className="font-display font-bold text-2xl sm:text-3xl text-[#142338] flex items-center gap-2">
          <CreditCard className="w-6 h-6 text-cyan-400" />
          Cấu Hình Tài Khoản Thanh Toán
        </h1>
        <p className="text-xs text-slate-600 mt-1">
          Quản lý thông tin tài khoản ngân hàng dùng để hiển thị QR thanh toán cho khách hàng.
        </p>
      </div>

      <div className="p-6 rounded-2xl bg-thuy-850 border border-thuy-750 space-y-5">
        <h2 className="font-semibold text-sm text-[#142338] border-b border-thuy-750 pb-3">
          Thông Tin Tài Khoản Ngân Hàng
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>Ngân Hàng</label>
            <select
              value={settings.bankName || ""}
              onChange={(e) => update("bankName", e.target.value)}
              className={inputCls}
            >
              <option value="">-- Chọn ngân hàng --</option>
              {bankList.map((bank) => (
                <option key={bank.code} value={bank.shortName}>
                  {bank.shortName}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelCls}>Số Tài Khoản</label>
            <input
              type="text"
              value={settings.bankAccount || ""}
              onChange={(e) => update("bankAccount", e.target.value)}
              className={inputCls}
              placeholder="Nhập số tài khoản ngân hàng"
            />
          </div>
          <div className="sm:col-span-2">
            <label className={labelCls}>Chủ Tài Khoản</label>
            <input
              type="text"
              value={settings.bankAccountName || ""}
              onChange={(e) => update("bankAccountName", e.target.value)}
              className={inputCls}
              placeholder="NGUYEN VAN A"
            />
            <p className="text-[10px] text-slate-500 mt-1">
              Nên viết in hoa, không dấu theo đúng tên trên tài khoản ngân hàng.
            </p>
          </div>
          <div className="sm:col-span-2">
            <label className={labelCls}>Ảnh QR tuỳ chỉnh (tuỳ chọn)</label>
            <input
              type="text"
              value={settings.bankQrUrl || ""}
              onChange={(e) => update("bankQrUrl", e.target.value)}
              className={inputCls}
              placeholder="Dán URL ảnh mã QR (nếu không dùng VietQR tự sinh)"
            />
            <p className="text-[10px] text-slate-500 mt-1">
              Để trống để hệ thống tự sinh mã VietQR theo ngân hàng/số tài khoản/số tiền/nội dung đơn.
            </p>
          </div>
        </div>

        {qrPreview && !settings.bankQrUrl && (
          <div className="pt-4 border-t border-thuy-750">
            <label className={labelCls}>Xem Trước Mã QR VietQR</label>
            <div className="mt-2 p-4 rounded-xl bg-white inline-block">
              <img src={qrPreview} alt="VietQR Preview" className="w-48 h-48" />
            </div>
            <p className="text-[10px] text-slate-500 mt-2">
              Mã QR này sẽ được hiển thị cho khách hàng khi thanh toán chuyển khoản.
            </p>
          </div>
        )}
      </div>

      <div className="p-6 rounded-2xl bg-thuy-850 border border-thuy-750 space-y-5">
        <h2 className="font-semibold text-sm text-[#142338] border-b border-thuy-750 pb-3 flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          Tự Động Nhận Diện Thanh Toán & Cấp Link Tải
        </h2>

        <div className="p-4 rounded-xl bg-thuy-900/70 border border-thuy-700 space-y-2 text-xs text-slate-300">
          <p>
            Để hệ thống <b className="text-white">tự xác nhận thanh toán</b> và <b className="text-white">cấp link tải</b> cho khách ngay khi nhận được tiền, hãy kết nối dịch vụ thông báo giao dịch ngân hàng (ví dụ: Casso, SePay, webhook ngân hàng) với endpoint bên dưới. Nội dung chuyển khoản phải chứa <b className="text-emerald-400">mã đơn hàng</b>.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4">
          <div>
            <label className={labelCls}>Webhook nhận thông báo thanh toán</label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={webhookUrl || "/api/payments/webhook"}
                className={`${inputCls} font-mono text-[11px]`}
              />
            </div>
            <p className="text-[10px] text-slate-500 mt-1 flex items-center gap-1.5">
              <Link2 className="w-3 h-3" />
              Gửi POST JSON tới URL này từ dịch vụ nhận biến động số dư. Hệ thống sẽ tìm đơn PENDING theo mã đơn trong nội dung và tự chuyển PAID + cấp link tải.
            </p>
          </div>

          <div>
            <label className={labelCls}>Payment Webhook Secret</label>
            <input
              type="text"
              value={settings.paymentWebhookSecret || ""}
              onChange={(e) => update("paymentWebhookSecret", e.target.value)}
              className={inputCls}
              placeholder="Nhập chuỗi bí mật để xác thực webhook"
            />
            <p className="text-[10px] text-slate-500 mt-1">
              Dịch vụ webhook phải gửi secret này qua header <code className="text-thuy-300">Authorization: Bearer &lt;secret&gt;</code> hoặc <code className="text-thuy-300">x-webhook-secret</code>. Để trống nếu bạn chưa cấu hình tự động (khi đó cần admin xác nhận thanh toán thủ công trong Quản lý đơn hàng).
            </p>
          </div>
        </div>
      </div>

      <div className="sticky bottom-0 flex flex-col sm:flex-row items-center justify-between gap-3 p-4 rounded-2xl bg-thuy-950/90 border border-thuy-750 backdrop-blur-md">
        <div className="flex items-center gap-2 text-xs min-h-[20px]">
          {message?.type === "ok" && (
            <>
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span className="text-emerald-300">{message.text}</span>
            </>
          )}
          {message?.type === "err" && (
            <>
              <AlertTriangle className="w-4 h-4 text-red-400" />
              <span className="text-red-300">{message.text}</span>
            </>
          )}
        </div>

        <button
          type="submit"
          disabled={saving}
          className="px-6 py-2.5 rounded-xl bg-thuy-400 text-thuy-950 font-bold text-xs uppercase tracking-wider hover:brightness-110 shadow-glow-cyan transition-all flex items-center gap-2 disabled:opacity-60"
        >
          {saving ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <Save className="w-3.5 h-3.5" />
          )}
          <span>Lưu Cấu Hình</span>
        </button>
      </div>
    </form>
  );
}

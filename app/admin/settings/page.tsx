"use client";

import React, { useState, useEffect } from "react";
import {
  Settings,
  Search,
  Code2,
  Save,
  Loader2,
  CheckCircle2,
  AlertTriangle,
  Info,
} from "lucide-react";

type TabKey = "system" | "seo" | "script";

const TABS: { key: TabKey; label: string; sub: string; icon: typeof Settings }[] = [
  {
    key: "system",
    label: "Cấu Hình Hệ Thống",
    sub: "Thông tin studio, liên hệ & mạng xã hội",
    icon: Settings,
  },
  {
    key: "seo",
    label: "Cài Đặt SEO",
    sub: "Meta tags, Open Graph & Google Analytics",
    icon: Search,
  },
  {
    key: "script",
    label: "Mã Tùy Chỉnh",
    sub: "Mã nhúng quảng cáo & theo dõi hiển thị toàn site",
    icon: Code2,
  },
];

const inputCls =
  "w-full px-3.5 py-2.5 rounded-xl bg-thuy-900 border border-thuy-700 text-xs text-white focus:outline-none focus:border-thuy-400 transition-colors";
const labelCls = "block text-xs text-slate-300 font-medium mb-1.5";

export default function AdminSettingsPage() {
  const [tab, setTab] = useState<TabKey>("system");
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  useEffect(() => {
    fetch("/api/settings")
      .then((r) => r.json())
      .then((data) => {
        if (data.settings) setSettings(data.settings);
      })
      .catch(() => setMessage({ type: "err", text: "Không tải được cấu hình." }))
      .finally(() => setLoading(false));
  }, []);

  const update = (key: string, value: string) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
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
      setMessage({ type: "ok", text: "Đã lưu cấu hình thành công." });
    } catch (err: any) {
      setMessage({ type: "err", text: err.message || "Đã xảy ra lỗi." });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24 gap-3 text-slate-400 text-xs">
        <Loader2 className="w-4 h-4 animate-spin" />
        <span>Đang tải cấu hình hệ thống...</span>
      </div>
    );
  }

  return (
    <form onSubmit={handleSave} className="space-y-6 max-w-5xl">
      <div>
        <h1 className="font-display font-bold text-2xl sm:text-3xl text-white">
          Cấu Hình Hệ Thống
        </h1>
        <p className="text-xs text-slate-400">
          Quản lý thông tin website, tối ưu SEO và mã nhúng quảng cáo hiển thị trên mọi trang.
        </p>
      </div>

      {/* Tabs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {TABS.map((t) => {
          const Icon = t.icon;
          const isActive = tab === t.key;
          return (
            <button
              key={t.key}
              type="button"
              onClick={() => {
                setTab(t.key);
                setMessage(null);
              }}
              className={`group text-left p-4 rounded-2xl border transition-all duration-300 ${
                isActive
                  ? "bg-thuy-850 border-thuy-400 shadow-glow-cyan"
                  : "bg-thuy-900/60 border-thuy-750 hover:border-thuy-500 hover:bg-thuy-850"
              }`}
            >
              <div className="flex items-center gap-2.5 mb-1.5">
                <Icon
                  className={`w-4 h-4 ${isActive ? "text-thuy-400" : "text-slate-400 group-hover:text-thuy-400"}`}
                />
                <span
                  className={`text-xs font-bold ${isActive ? "text-white" : "text-slate-200"}`}
                >
                  {t.label}
                </span>
              </div>
              <span className="text-[11px] text-slate-400 leading-relaxed block">{t.sub}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: SYSTEM */}
      {tab === "system" && (
        <div className="p-6 rounded-2xl bg-thuy-850 border border-thuy-750 space-y-5">
          <h2 className="font-semibold text-sm text-white border-b border-thuy-750 pb-3">
            1.1. Thông Tin Studio
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Tên Website</label>
              <input
                type="text"
                value={settings.siteName || ""}
                onChange={(e) => update("siteName", e.target.value)}
                className={inputCls}
                placeholder="ACD Architecture & Design"
              />
            </div>
            <div>
              <label className={labelCls}>Tagline</label>
              <input
                type="text"
                value={settings.siteTagline || ""}
                onChange={(e) => update("siteTagline", e.target.value)}
                className={inputCls}
              />
            </div>
            <div className="sm:col-span-2">
              <label className={labelCls}>Mô Tả Ngắn</label>
              <textarea
                rows={3}
                value={settings.siteDescription || ""}
                onChange={(e) => update("siteDescription", e.target.value)}
                className={inputCls}
              />
            </div>
          </div>

          <h2 className="font-semibold text-sm text-white border-b border-thuy-750 pb-3 pt-2">
            1.2. Thông Tin Liên Hệ
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Email Liên Hệ</label>
              <input
                type="email"
                value={settings.contactEmail || ""}
                onChange={(e) => update("contactEmail", e.target.value)}
                className={inputCls}
              />
            </div>
            <div>
              <label className={labelCls}>Hotline</label>
              <input
                type="text"
                value={settings.contactPhone || ""}
                onChange={(e) => update("contactPhone", e.target.value)}
                className={inputCls}
              />
            </div>
            <div className="sm:col-span-2">
              <label className={labelCls}>Địa Chỉ Văn Phòng</label>
              <input
                type="text"
                value={settings.contactAddress || ""}
                onChange={(e) => update("contactAddress", e.target.value)}
                className={inputCls}
              />
            </div>
            <div>
              <label className={labelCls}>Số Zalo</label>
              <input
                type="text"
                value={settings.zaloNumber || ""}
                onChange={(e) => update("zaloNumber", e.target.value)}
                className={inputCls}
                placeholder="0912345678"
              />
            </div>
          </div>

          <h2 className="font-semibold text-sm text-white border-b border-thuy-750 pb-3 pt-2">
            1.3. Mạng Xã Hội
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className={labelCls}>Facebook URL</label>
              <input
                type="url"
                value={settings.facebookUrl || ""}
                onChange={(e) => update("facebookUrl", e.target.value)}
                className={inputCls}
                placeholder="https://facebook.com/..."
              />
            </div>
            <div>
              <label className={labelCls}>Instagram URL</label>
              <input
                type="url"
                value={settings.instagramUrl || ""}
                onChange={(e) => update("instagramUrl", e.target.value)}
                className={inputCls}
                placeholder="https://instagram.com/..."
              />
            </div>
            <div>
              <label className={labelCls}>YouTube URL</label>
              <input
                type="url"
                value={settings.youtubeUrl || ""}
                onChange={(e) => update("youtubeUrl", e.target.value)}
                className={inputCls}
                placeholder="https://youtube.com/..."
              />
            </div>
          </div>

          <div className="pt-2 flex items-center gap-3 p-4 rounded-xl bg-thuy-900 border border-thuy-750">
            <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-xs font-semibold text-white">Chế Độ Bảo Trì</p>
              <p className="text-[11px] text-slate-400">
                Bật để tạm ẩn nội dung website và hiển thị trang thông báo bảo trì.
              </p>
            </div>
            <select
              value={settings.maintenanceMode || "false"}
              onChange={(e) => update("maintenanceMode", e.target.value)}
              className="px-3 py-2 rounded-xl bg-thuy-950 border border-thuy-700 text-xs text-white focus:outline-none focus:border-thuy-400"
            >
              <option value="false">Tắt</option>
              <option value="true">Bật</option>
            </select>
          </div>
        </div>
      )}

      {/* TAB 2: SEO */}
      {tab === "seo" && (
        <div className="p-6 rounded-2xl bg-thuy-850 border border-thuy-750 space-y-5">
          <h2 className="font-semibold text-sm text-white border-b border-thuy-750 pb-3">
            2.1. Meta Tags Cơ Bản
          </h2>

          <div className="space-y-4">
            <div>
              <label className={labelCls}>SEO Title</label>
              <input
                type="text"
                value={settings.seoTitle || ""}
                onChange={(e) => update("seoTitle", e.target.value)}
                className={inputCls}
              />
              <p className="text-[10px] text-slate-500 mt-1">
                Tiêu đề hiển thị trên Google. Nên dài 50-60 ký tự.
              </p>
            </div>
            <div>
              <label className={labelCls}>Meta Description</label>
              <textarea
                rows={3}
                value={settings.seoDescription || ""}
                onChange={(e) => update("seoDescription", e.target.value)}
                className={inputCls}
              />
              <p className="text-[10px] text-slate-500 mt-1">
                Mô tả trang kết quả tìm kiếm. Nên dài 150-160 ký tự.
              </p>
            </div>
            <div>
              <label className={labelCls}>Meta Keywords</label>
              <textarea
                rows={2}
                value={settings.seoKeywords || ""}
                onChange={(e) => update("seoKeywords", e.target.value)}
                className={inputCls}
              />
              <p className="text-[10px] text-slate-500 mt-1">Ngăn cách bằng dấu phẩy.</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Ảnh Chia Sẻ (OG Image URL)</label>
                <input
                  type="url"
                  value={settings.seoOgImage || ""}
                  onChange={(e) => update("seoOgImage", e.target.value)}
                  className={inputCls}
                  placeholder="https://..."
                />
              </div>
              <div>
                <label className={labelCls}>Robots</label>
                <select
                  value={settings.seoRobots || "index, follow"}
                  onChange={(e) => update("seoRobots", e.target.value)}
                  className={inputCls}
                >
                  <option value="index, follow">index, follow</option>
                  <option value="noindex, follow">noindex, follow</option>
                  <option value="index, nofollow">index, nofollow</option>
                  <option value="noindex, nofollow">noindex, nofollow</option>
                </select>
              </div>
            </div>
          </div>

          <h2 className="font-semibold text-sm text-white border-b border-thuy-750 pb-3 pt-2">
            2.2. Xác Minh & Đo Lường
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Google Analytics ID</label>
              <input
                type="text"
                value={settings.googleAnalyticsId || ""}
                onChange={(e) => update("googleAnalyticsId", e.target.value)}
                className={inputCls}
                placeholder="G-XXXXXXXXXX / UA-XXXXXXX-X"
              />
              <p className="text-[10px] text-slate-500 mt-1">
                Mã GA4 được chèn tự động vào thẻ &lt;head&gt; của mọi trang.
              </p>
            </div>
            <div>
              <label className={labelCls}>Google Site Verification</label>
              <input
                type="text"
                value={settings.googleSiteVerification || ""}
                onChange={(e) => update("googleSiteVerification", e.target.value)}
                className={inputCls}
                placeholder="<meta name='google-site-verification' content='...'>"
              />
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: CUSTOM SCRIPT */}
      {tab === "script" && (
        <div className="p-6 rounded-2xl bg-thuy-850 border border-thuy-750 space-y-5">
          <div className="flex items-start gap-3 p-4 rounded-xl bg-thuy-900 border border-thuy-700">
            <Info className="w-4 h-4 text-thuy-400 flex-shrink-0 mt-0.5" />
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Dán mã quảng cáo Google AdSense hoặc bất kỳ dịch vụ quảng cáo/kiểm tra nào vào đây.
              Mã sẽ được chèn vào <b className="text-slate-200">&lt;head&gt;</b> của{" "}
              <b className="text-slate-200">mọi trang</b> của website, kích hoạt ngay sau khi lưu.
            </p>
          </div>

          <div className="space-y-1.5">
            <label className={labelCls}>Mã chèn thẻ (Header Embed Code)</label>
            <textarea
              rows={10}
              value={settings.headerEmbedCode || ""}
              onChange={(e) => update("headerEmbedCode", e.target.value)}
              className={`${inputCls} font-mono leading-relaxed`}
              placeholder={`<!-- Google AdSense -->\n<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-XXXXXXXXXXXXXXX" crossorigin="anonymous" data-ad-client="ca-pub-XXXXXXXXXXXXXXX"></script>`}
            />
            <p className="text-[10px] text-slate-500">
              Được chèn vào thẻ &lt;head&gt; của mọi trang. Phù hợp cho Google AdSense, Google
              Tag Manager, Facebook Pixel, Microsoft Clarity...
            </p>
          </div>

          <div className="space-y-1.5">
            <label className={labelCls}>Mã chèn thân trang (Body Embed Code)</label>
            <textarea
              rows={8}
              value={settings.bodyEmbedCode || ""}
              onChange={(e) => update("bodyEmbedCode", e.target.value)}
              className={`${inputCls} font-mono leading-relaxed`}
              placeholder={'<!-- Mã chèn trước thẻ </body> -->\n<script>\n  // your script here\n</script>'}
            />
            <p className="text-[10px] text-slate-500">
              Được chèn ngay trước thẻ đóng &lt;/body&gt;. Dùng cho mã cần chạy sau khi tải trang
              (ví dụ: adsense auto ads, chat widget, event tracking).
            </p>
          </div>
        </div>
      )}

      {/* Save bar */}
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
          {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
          <span>Lưu Cấu Hình</span>
        </button>
      </div>
    </form>
  );
}

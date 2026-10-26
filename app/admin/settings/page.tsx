"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import MediaPickerModal, { MediaItem } from "@/components/media/MediaPickerModal";
import { resolveHeroVideo, playableVideoUrl, resolveVideoFit } from "@/lib/media-url";
import CmsSyncButton from "@/components/admin/CmsSyncButton";

import {
  Settings,
  Search,
  Code2,
  Save,
  Loader2,
  CheckCircle2,
  AlertTriangle,
  Info,
  Image as ImageIcon,
  Video as VideoIcon,
  Upload,
  Trash2,
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
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [message, setMessage] = useState<{ type: "ok" | "err"; text: string } | null>(null);
  const [isMediaModalOpen, setIsMediaModalOpen] = useState(false);
  const [mediaTarget, setMediaTarget] = useState<
    "heroBackgroundImage" | "heroBackgroundVideo" | "heroVideoPoster"
  >("heroBackgroundImage");

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
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((data) => {
        if (data.user?.role === "SUPER_ADMIN") setIsSuperAdmin(true);
      })
      .catch(() => {});
  }, []);

  const update = (key: string, value: string) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const heroVideoPreview = resolveHeroVideo(settings.heroBackgroundVideo || "");
  const heroVideoFit = resolveVideoFit(
    settings.heroVideoFit || "cover",
    settings.heroVideoAspect || ""
  );

  // Đọc kích thước thật của video để chọn cách hiển thị (tránh phóng to/cắt)
  useEffect(() => {
    const url = settings.heroBackgroundVideo;
    if (!url) return;

    let cancelled = false;
    const probe = document.createElement("video");
    probe.preload = "metadata";
    probe.muted = true;
    probe.onloadedmetadata = () => {
      if (cancelled) return;
      if (probe.videoWidth && probe.videoHeight) {
        update(
          "heroVideoAspect",
          `${probe.videoWidth}x${probe.videoHeight}`
        );
      }
    };
    probe.src = playableVideoUrl(url);
    return () => {
      cancelled = true;
      probe.removeAttribute("src");
      probe.load();
    };
  }, [settings.heroBackgroundVideo]);

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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
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

          <h2 className="font-semibold text-sm text-white border-b border-thuy-750 pb-3 pt-2">
            1.4. Nền Hero (Ảnh / Video)
          </h2>

          {/* Type switch */}
          <div className="flex items-center gap-2 p-1 rounded-xl bg-thuy-900 border border-thuy-750 w-fit">
            {(
              [
                { key: "image", label: "Ảnh nền" },
                { key: "video", label: "Video nền (lặp)" },
              ] as const
            ).map((opt) => (
              <button
                key={opt.key}
                type="button"
                onClick={() => update("heroBackgroundType", opt.key)}
                className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
                  (settings.heroBackgroundType || "image") === opt.key
                    ? "bg-thuy-400 text-thuy-950 font-bold"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>

          {(settings.heroBackgroundType || "image") === "video" ? (
            /* ============ VIDEO MODE ============ */
            <div className="space-y-5">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <label className={labelCls}>
                    Link video nền (Desktop){" "}
                    <span className="text-slate-500 font-normal">
                      — file .mp4 / .webm trực tiếp
                    </span>
                  </label>
                  <div className="relative aspect-[16/9] rounded-2xl overflow-hidden bg-thuy-950 border border-thuy-750">
                    {heroVideoPreview?.kind === "file" ? (
                      <video
                        src={heroVideoPreview.src}
                        className={`w-full h-full object-center ${
                          heroVideoFit === "contain" ? "object-contain" : "object-cover"
                        }`}
                        autoPlay
                        muted
                        loop
                        playsInline
                      />
                    ) : heroVideoPreview?.kind === "embed" ? (
                      <iframe
                        src={heroVideoPreview.src}
                        title="Hero video preview"
                        allow="autoplay; fullscreen; encrypted-media"
                        allowFullScreen
                        className="w-full h-full border-0"
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center gap-2 text-slate-500">
                        <VideoIcon className="w-7 h-7" />
                        <span className="text-[11px]">Chưa chọn video nền</span>
                      </div>
                    )}
                  </div>
                  <input
                    type="text"
                    value={settings.heroBackgroundVideo || ""}
                    onChange={(e) => update("heroBackgroundVideo", e.target.value)}
                    className={inputCls}
                    placeholder="https://assets.mixkit.co/videos/.../hero.mp4"
                  />
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setMediaTarget("heroBackgroundVideo");
                        setIsMediaModalOpen(true);
                      }}
                      className="flex-1 px-3 py-2 rounded-xl bg-thuy-800 hover:bg-thuy-750 text-slate-200 hover:text-white border border-thuy-700 text-xs font-semibold transition-all flex items-center justify-center gap-1.5"
                    >
                      <Upload className="w-3.5 h-3.5 text-thuy-400" />
                      <span>Chọn video từ Media Library</span>
                    </button>
                    {settings.heroBackgroundVideo && (
                      <button
                        type="button"
                        onClick={() => update("heroBackgroundVideo", "")}
                        className="px-3 py-2 rounded-xl bg-thuy-900 hover:bg-red-950/40 text-slate-400 hover:text-red-300 border border-thuy-700 transition-all"
                        title="Xóa video nền"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                  <p className="text-[10px] text-slate-500">
                    Hỗ trợ lấy từ nhiều nguồn: Mixkit, Coverr, Pexels Videos, Cloudinary,
                    Bunny CDN hoặc bất kỳ link .mp4/.webm trực tiếp. Video tự chạy lặp, tắt
                    tiếng, không điều khiển.
                  </p>
                  <p className="text-[10px] text-thuy-300/80">
                    Link Google Drive, YouTube hoặc Vimeo được tự động chuyển đổi sang nguồn
                    phát được — chỉ cần dán link gốc.
                  </p>

                  <div className="space-y-2 pt-1">
                    <label className={labelCls}>Cách hiển thị video</label>
                    <select
                      value={settings.heroVideoFit || "cover"}
                      onChange={(e) => update("heroVideoFit", e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl bg-thuy-900 border border-thuy-700 text-xs text-white focus:outline-none focus:border-thuy-400"
                    >
                      <option value="cover">Phủ kín toàn bộ nền (khuyến nghị)</option>
                      <option value="contain">Vừa khung (không cắt mép)</option>
                    </select>
                    <p className="text-[10px] text-slate-500">
                      “Phủ kín” cho video phủ trọn màn hình như nền. Video không có ảnh poster
                      nên không bị nháy ảnh trước khi video chạy.
                    </p>
                    {settings.heroVideoAspect && (
                      <p className="text-[10px] text-slate-400">
                        Kích thước video hiện tại:{" "}
                        <b className="text-thuy-300">
                          {settings.heroVideoAspect.replace("x", " x ")}
                        </b>
                        {settings.heroVideoAspect.startsWith("720") &&
                          " — nên dùng video nền ngang ≥ 1920x1080 để không bị mờ."}
                      </p>
                    )}
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className={labelCls}>
                      Link video nền (Mobile){" "}
                      <span className="text-slate-500 font-normal">
                        — để trống để dùng video desktop
                      </span>
                    </label>
                    <input
                      type="text"
                      value={settings.heroBackgroundVideoMobile || ""}
                      onChange={(e) => update("heroBackgroundVideoMobile", e.target.value)}
                      className={inputCls}
                      placeholder="https://.../hero-mobile.mp4"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className={labelCls}>
                      Ảnh Poster (ảnh hiển thị trước khi video tải)
                    </label>
                    <div className="relative aspect-[16/9] rounded-2xl overflow-hidden bg-thuy-950 border border-thuy-750">
                      {settings.heroVideoPoster ? (
                        <Image
                          src={settings.heroVideoPoster}
                          alt="Video poster preview"
                          fill
                          className="object-cover"
                          unoptimized
                        />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center gap-2 text-slate-500">
                          <ImageIcon className="w-7 h-7" />
                          <span className="text-[11px]">Chưa chọn poster</span>
                        </div>
                      )}
                    </div>
                    <input
                      type="text"
                      value={settings.heroVideoPoster || ""}
                      onChange={(e) => update("heroVideoPoster", e.target.value)}
                      className={inputCls}
                      placeholder="https://... (URL ảnh poster)"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setMediaTarget("heroVideoPoster");
                        setIsMediaModalOpen(true);
                      }}
                      className="w-full px-3 py-2 rounded-xl bg-thuy-800 hover:bg-thuy-750 text-slate-200 hover:text-white border border-thuy-700 text-xs font-semibold transition-all flex items-center justify-center gap-1.5"
                    >
                      <Upload className="w-3.5 h-3.5 text-thuy-400" />
                      <span>Chọn poster từ Media Library</span>
                    </button>
                  </div>

                  <div className="space-y-2">
                    <label className={labelCls}>
                      Mã nhúng video (YouTube / Vimeo){" "}
                      <span className="text-slate-500 font-normal">— tùy chọn</span>
                    </label>
                    <textarea
                      rows={4}
                      value={settings.heroVideoEmbedCode || ""}
                      onChange={(e) => update("heroVideoEmbedCode", e.target.value)}
                      className={`${inputCls} font-mono leading-relaxed`}
                      placeholder={'<iframe src="https://www.youtube.com/embed/VIDEO_ID?autoplay=1&mute=1&loop=1&playlist=VIDEO_ID" ...></iframe>'}
                    />
                    <p className="text-[10px] text-slate-500">
                      Dùng khi không có link file trực tiếp. Nhớ thêm{" "}
                      <code className="text-thuy-300">autoplay=1</code>,{" "}
                      <code className="text-thuy-300">mute=1</code>,{" "}
                      <code className="text-thuy-300">loop=1</code> để video chạy lặp không
                      tiếng.
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className={labelCls}>
                  Độ Đậm Lớp Phủ:{" "}
                  <span className="text-thuy-300 font-bold">
                    {settings.heroOverlayOpacity || "60"}%
                  </span>
                </label>
                <input
                  type="range"
                  min={0}
                  max={100}
                  step={5}
                  value={settings.heroOverlayOpacity || "60"}
                  onChange={(e) => update("heroOverlayOpacity", e.target.value)}
                  className="w-full accent-thuy-400"
                />
                <p className="text-[10px] text-slate-500">
                  Tăng giá trị để phủ tối hơn, giúp chữ và menu dễ đọc hơn trên video nền.
                </p>
              </div>
            </div>
          ) : (
            /* ============ IMAGE MODE ============ */
            <div className="space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                {/* Desktop hero */}
                <div className="space-y-2">
                  <label className={labelCls}>Ảnh Nền Hero (Desktop)</label>
                  <div className="relative aspect-[16/9] rounded-2xl overflow-hidden bg-thuy-950 border border-thuy-750">
                    {settings.heroBackgroundImage ? (
                      <Image
                        src={settings.heroBackgroundImage}
                        alt="Hero background preview"
                        fill
                        className="object-cover"
                        unoptimized
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center gap-2 text-slate-500">
                        <ImageIcon className="w-7 h-7" />
                        <span className="text-[11px]">Chưa chọn ảnh nền</span>
                      </div>
                    )}
                  </div>
                  <input
                    type="text"
                    value={settings.heroBackgroundImage || ""}
                    onChange={(e) => update("heroBackgroundImage", e.target.value)}
                    className={inputCls}
                    placeholder="https://... (URL ảnh nền hero)"
                  />
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setMediaTarget("heroBackgroundImage");
                        setIsMediaModalOpen(true);
                      }}
                      className="flex-1 px-3 py-2 rounded-xl bg-thuy-800 hover:bg-thuy-750 text-slate-200 hover:text-white border border-thuy-700 text-xs font-semibold transition-all flex items-center justify-center gap-1.5"
                    >
                      <Upload className="w-3.5 h-3.5 text-thuy-400" />
                      <span>Chọn từ Media Library</span>
                    </button>
                    {settings.heroBackgroundImage && (
                      <button
                        type="button"
                        onClick={() => update("heroBackgroundImage", "")}
                        className="px-3 py-2 rounded-xl bg-thuy-900 hover:bg-red-950/40 text-slate-400 hover:text-red-300 border border-thuy-700 transition-all"
                        title="Xóa ảnh nền"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Mobile hero + overlay */}
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className={labelCls}>
                      Ảnh Nền Hero (Mobile){" "}
                      <span className="text-slate-500 font-normal">
                        — để trống để dùng ảnh desktop
                      </span>
                    </label>
                    <div className="relative aspect-[9/16] max-h-[240px] rounded-2xl overflow-hidden bg-thuy-950 border border-thuy-750">
                      {settings.heroBackgroundImageMobile || settings.heroBackgroundImage ? (
                        <Image
                          src={settings.heroBackgroundImageMobile || settings.heroBackgroundImage}
                          alt="Hero mobile preview"
                          fill
                          className="object-cover"
                          unoptimized
                        />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center gap-2 text-slate-500">
                          <ImageIcon className="w-7 h-7" />
                          <span className="text-[11px]">Chưa chọn ảnh nền</span>
                        </div>
                      )}
                    </div>
                    <input
                      type="text"
                      value={settings.heroBackgroundImageMobile || ""}
                      onChange={(e) => update("heroBackgroundImageMobile", e.target.value)}
                      className={inputCls}
                      placeholder="https://... (URL ảnh nền mobile)"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className={labelCls}>
                      Độ Đậm Lớp Phủ:{" "}
                      <span className="text-thuy-300 font-bold">
                        {settings.heroOverlayOpacity || "60"}%
                      </span>
                    </label>
                    <input
                      type="range"
                      min={0}
                      max={100}
                      step={5}
                      value={settings.heroOverlayOpacity || "60"}
                      onChange={(e) => update("heroOverlayOpacity", e.target.value)}
                      className="w-full accent-thuy-400"
                    />
                    <p className="text-[10px] text-slate-500">
                      Tăng giá trị để phủ tối hơn, giúp chữ và menu dễ đọc hơn trên ảnh nền.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

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

      {/* Payment / Bank info (Super Admin) */}
      {isSuperAdmin && (
      <div className="rounded-2xl bg-thuy-850 border border-thuy-750 p-6 space-y-4">
        <h2 className="font-semibold text-sm text-white border-b border-thuy-750 pb-2">
          Thông Tin Thanh Toán (Super Admin)
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>Tên ngân hàng</label>
            <input type="text" value={settings.bankName || ""} onChange={(e) => update("bankName", e.target.value)} className={inputCls} placeholder="Vietcombank" />
          </div>
          <div>
            <label className={labelCls}>Số tài khoản</label>
            <input type="text" value={settings.bankAccount || ""} onChange={(e) => update("bankAccount", e.target.value)} className={inputCls} placeholder="0123456789" />
          </div>
          <div>
            <label className={labelCls}>Chủ tài khoản</label>
            <input type="text" value={settings.bankAccountName || ""} onChange={(e) => update("bankAccountName", e.target.value)} className={inputCls} placeholder="NGUYEN VAN A" />
          </div>
          <div>
            <label className={labelCls}>URL ảnh QR Code</label>
            <input type="text" value={settings.bankQrUrl || ""} onChange={(e) => update("bankQrUrl", e.target.value)} className={inputCls} placeholder="https://..." />
          </div>
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

        <div className="flex items-center gap-3">
          <CmsSyncButton
            label="Đồng bộ mã nguồn"
            className="shrink-0"
          />
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
      </div>

      {/* Media Picker Modal */}
      <MediaPickerModal
        isOpen={isMediaModalOpen}
        onClose={() => setIsMediaModalOpen(false)}
        onSelect={(selected) => {
          if (!Array.isArray(selected)) {
            update(mediaTarget, selected.url);
          }
          setIsMediaModalOpen(false);
        }}
        multiple={false}
        selectedIds={[]}
        mediaType={mediaTarget === "heroBackgroundVideo" ? "video" : "image"}
        title={
          mediaTarget === "heroBackgroundVideo"
            ? "Chọn video nền Hero"
            : mediaTarget === "heroVideoPoster"
              ? "Chọn ảnh poster cho video"
              : "Chọn ảnh nền Hero"
        }
      />
    </form>
  );
}

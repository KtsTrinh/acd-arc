import React from "react";
import Link from "next/link";
import {
  Compass,
  Phone,
  Mail,
  MapPin,
  ShieldCheck,
  ArrowUpRight,
} from "lucide-react";
import { getSettings } from "@/lib/settings";

export const revalidate = 0;

export default async function Footer() {
  const settings = await getSettings();

  return (
    <footer className="border-t border-thuy-750 bg-thuy-950 text-slate-400 text-sm mt-24">
      {/* Top Banner with Water Motif */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
        {/* Brand & Philosophy */}
        <div className="lg:col-span-2 space-y-4">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-thuy-400 to-thuy-700 p-0.5 flex items-center justify-center shadow-glow-cyan">
              <div className="w-full h-full bg-thuy-950 rounded-[10px] flex items-center justify-center">
                <span className="font-display font-black text-white text-base">
                  ACD
                </span>
              </div>
            </div>
            <span className="font-display font-bold text-xl text-white tracking-wide">
              {settings.siteName || "ACD ARCHITECTURE"}
            </span>
          </Link>

          <p className="text-slate-400 text-xs leading-relaxed max-w-sm">
            {settings.siteDescription ||
              "Studio kiến trúc tiên phong ứng dụng triết lý phong thủy ngũ hành hợp mệnh (Kim - Mộc - Thủy - Hỏa - Thổ). Tối giản, sang trọng và kiến tạo không gian sống tương sinh mang lại thịnh vượng cho từng gia chủ."}
          </p>

          <div className="pt-2 flex items-center gap-2 text-xs text-thuy-300">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>
              Bản quyền thiết kế độc bản & hồ sơ kỹ thuật số tiêu chuẩn cao.
            </span>
          </div>
        </div>

        {/* Categories */}
        <div className="space-y-3">
          <h4 className="text-white font-semibold text-xs uppercase tracking-wider">
            Danh Mục Sản Phẩm
          </h4>
          <ul className="space-y-2 text-xs">
            <li>
              <Link
                href="/products"
                className="hover:text-thuy-400 transition-colors"
              >
                Tất cả sản phẩm
              </Link>
            </li>
            <li>
              <Link
                href="/cart"
                className="hover:text-thuy-400 transition-colors"
              >
                Giỏ hàng &amp; thanh toán
              </Link>
            </li>
          </ul>
        </div>

        {/* Resources */}
        <div className="space-y-3">
          <h4 className="text-white font-semibold text-xs uppercase tracking-wider">
            Tài Nguyên &amp; Dịch Vụ
          </h4>
          <ul className="space-y-2 text-xs">
            <li>
              <Link
                href="/products"
                className="hover:text-thuy-400 transition-colors"
              >
                Khám phá sản phẩm
              </Link>
            </li>
            <li>
              <Link
                href="/account"
                className="hover:text-thuy-400 transition-colors"
              >
                Kiểm tra link tải đã mua
              </Link>
            </li>
          </ul>
        </div>

        {/* Office Contact */}
        <div className="space-y-3">
          <h4 className="text-white font-semibold text-xs uppercase tracking-wider">
            Liên Hệ ACD Studio
          </h4>
          <ul className="space-y-2.5 text-xs">
            <li className="flex items-start gap-2">
              <MapPin className="w-3.5 h-3.5 text-thuy-400 mt-0.5 flex-shrink-0" />
              <span>Chủ sở hữu website: {settings.siteOwner}</span>
            </li>
            <li className="flex items-start gap-2">
              <MapPin className="w-3.5 h-3.5 text-thuy-400 mt-0.5 flex-shrink-0" />
              <span>Địa chỉ: {settings.contactAddress}</span>
            </li>
            {settings.taxCode && (
              <li className="flex items-start gap-2">
                <MapPin className="w-3.5 h-3.5 text-thuy-400 mt-0.5 flex-shrink-0" />
                <span>Mã số thuế: {settings.taxCode}</span>
              </li>
            )}
            <li className="flex items-center gap-2">
              <Phone className="w-3.5 h-3.5 text-thuy-400 flex-shrink-0" />
              <span className="text-slate-200 font-medium">
                Hotline: {settings.contactPhone}
              </span>
            </li>
            <li className="flex items-center gap-2">
              <Mail className="w-3.5 h-3.5 text-thuy-400 flex-shrink-0" />
              <a
                href={`mailto:${settings.contactEmail}`}
                className="hover:text-thuy-400 transition-colors"
              >
                {settings.contactEmail}
              </a>
            </li>
            {(settings.facebookUrl ||
              settings.instagramUrl ||
              settings.youtubeUrl) && (
              <li className="flex items-center gap-3 pt-1">
                {settings.facebookUrl && (
                  <a
                    href={settings.facebookUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-thuy-400 transition-colors"
                  >
                    Facebook
                  </a>
                )}
                {settings.instagramUrl && (
                  <a
                    href={settings.instagramUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-thuy-400 transition-colors"
                  >
                    Instagram
                  </a>
                )}
                {settings.youtubeUrl && (
                  <a
                    href={settings.youtubeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-thuy-400 transition-colors"
                  >
                    YouTube
                  </a>
                )}
              </li>
            )}
          </ul>
        </div>
      </div>

      {/* Bottom Legal bar */}
      <div className="border-t border-thuy-850 bg-thuy-950/60 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between text-xs gap-4 text-slate-500">
          <p>
            © {new Date().getFullYear()} ACD Architecture & Interior Design
            Studio. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <Link
              href="/admin"
              className="hover:text-thuy-400 transition-colors"
            >
              Hệ thống Quản Trị CMS
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

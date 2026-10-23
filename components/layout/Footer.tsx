import React from "react";
import Link from "next/link";
import { Compass, Phone, Mail, MapPin, ShieldCheck, ArrowUpRight } from "lucide-react";
import { getSettings } from "@/lib/settings";

export const revalidate = 0;

export default async function Footer() {
  const settings = await getSettings();

  return (
    <footer className="border-t border-navy-800 bg-navy-950 text-slate-300 text-sm mt-24">
      {/* Top Banner with Water Motif */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
        {/* Brand & Philosophy */}
        <div className="lg:col-span-2 space-y-4">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-thuy-400 to-thuy-700 p-0.5 flex items-center justify-center shadow-glow-cyan">
              <div className="w-full h-full bg-thuy-950 rounded-[10px] flex items-center justify-center">
                <span className="font-display font-black text-white text-base">ACD</span>
              </div>
            </div>
            <span className="font-display font-bold text-xl text-white tracking-wide">
              {settings.siteName || "ACD ARCHITECTURE"}
            </span>
          </Link>

          <p className="text-slate-400 text-xs leading-relaxed max-w-sm">
            {settings.siteDescription ||
              "Studio kiến trúc & nội thất tiên phong ứng dụng triết lý phong thủy ngũ hành hợp mệnh (Kim - Mộc - Thủy - Hỏa - Thổ). Tối giản, sang trọng và kiến tạo không gian sống tương sinh mang lại thịnh vượng cho từng gia chủ."}
          </p>

          <div className="pt-2 flex items-center gap-2 text-xs text-thuy-300">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Bản quyền thiết kế độc bản & hồ sơ kỹ thuật số tiêu chuẩn cao.</span>
          </div>
        </div>

        {/* Categories */}
        <div className="space-y-3">
          <h4 className="text-white font-semibold text-xs uppercase tracking-wider">Hạng Mục Dự Án</h4>
          <ul className="space-y-2 text-xs">
            <li>
              <Link href="/projects?category=biet-thu-villa" className="hover:text-thuy-400 transition-colors">
                Biệt Thự & Villa Nghỉ Dưỡng
              </Link>
            </li>
            <li>
              <Link href="/projects?category=nha-pho-hien-dai" className="hover:text-thuy-400 transition-colors">
                Nhà Phố Hiện Đại
              </Link>
            </li>
            <li>
              <Link href="/projects?category=noi-that-cao-cap" className="hover:text-thuy-400 transition-colors">
                Nội Thất Sang Trọng
              </Link>
            </li>
            <li>
              <Link href="/projects?category=penthouse-can-ho" className="hover:text-thuy-400 transition-colors">
                Penthouse & Duplex
              </Link>
            </li>
            <li>
              <Link href="/projects?category=canh-quan-resort" className="hover:text-thuy-400 transition-colors">
                Cảnh Quan & Resort Sinh Thái
              </Link>
            </li>
          </ul>
        </div>

        {/* Resources E-commerce */}
        <div className="space-y-3">
          <h4 className="text-white font-semibold text-xs uppercase tracking-wider">Kho Tài Nguyên Kỹ Thuật</h4>
          <ul className="space-y-2 text-xs">
            <li>
              <Link href="/products?type=CAD" className="hover:text-thuy-400 transition-colors">
                Hồ Sơ Bản Vẽ AutoCAD (.DWG)
              </Link>
            </li>
            <li>
              <Link href="/products?type=MODEL_3D" className="hover:text-thuy-400 transition-colors">
                Thư Viện 3D Max & SketchUp
              </Link>
            </li>
            <li>
              <Link href="/products?type=INTERIOR" className="hover:text-thuy-400 transition-colors">
                Model Nội Thất PBR 4K
              </Link>
            </li>
            <li>
              <Link href="/products?type=TEMPLATE" className="hover:text-thuy-400 transition-colors">
                Template Photoshop & Layout
              </Link>
            </li>
            <li>
              <Link href="/account" className="hover:text-thuy-400 transition-colors">
                Kiểm Tra Link Tải Đã Mua
              </Link>
            </li>
          </ul>
        </div>

        {/* Office Contact */}
        <div className="space-y-3">
          <h4 className="text-white font-semibold text-xs uppercase tracking-wider">Liên Hệ Studio</h4>
          <ul className="space-y-2.5 text-xs">
            <li className="flex items-start gap-2">
              <MapPin className="w-3.5 h-3.5 text-thuy-400 mt-0.5 flex-shrink-0" />
              <span>{settings.contactAddress}</span>
            </li>
            <li className="flex items-center gap-2">
              <Phone className="w-3.5 h-3.5 text-thuy-400 flex-shrink-0" />
              <span className="text-slate-200 font-medium">Hotline: {settings.contactPhone}</span>
            </li>
            <li className="flex items-center gap-2">
              <Mail className="w-3.5 h-3.5 text-thuy-400 flex-shrink-0" />
              <a href={`mailto:${settings.contactEmail}`} className="hover:text-thuy-400 transition-colors">
                {settings.contactEmail}
              </a>
            </li>
            {(settings.facebookUrl || settings.instagramUrl || settings.youtubeUrl) && (
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
          <p>© {new Date().getFullYear()} ACD Architecture & Interior Design Studio. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <Link href="/admin" className="hover:text-thuy-400 transition-colors">
              Hệ thống Quản Trị CMS
            </Link>
            <span>•</span>
            <Link href="/blog" className="hover:text-thuy-400 transition-colors">
              Tạp Chí Phong Thủy Hợp Mệnh (Ngũ Hành)
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}


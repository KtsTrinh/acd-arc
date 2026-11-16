import React from "react";
import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import { getSettings, normalizeMediaUrl, resolveHeroVideo } from "@/lib/settings";
import { resolveVideoFit } from "@/lib/media-url";
import { ArrowRight } from "lucide-react";

export const revalidate = 0;

const FALLBACK_HERO = "https://i.pinimg.com/736x/ef/ec/58/efec58efa298d13dca0dde95e2528f20.jpg";

export default async function HomePage() {
  const [groups, settings] = await Promise.all([
    (prisma as any).product
      .groupBy({
        by: ["productGroup"],
        where: { active: true, productGroup: { not: null } },
        _count: { _all: true },
        orderBy: { productGroup: "asc" },
      })
      .catch(() => []),
    getSettings(),
  ]);

  const heroDesktop = normalizeMediaUrl(settings.heroBackgroundImage) || FALLBACK_HERO;
  const heroMobile = normalizeMediaUrl(settings.heroBackgroundImageMobile) || heroDesktop;
  const overlay = Math.min(100, Math.max(0, Number(settings.heroOverlayOpacity ?? 60)));
  const overlayPct = Math.round(overlay * 0.9);
  const isVideo = settings.heroBackgroundType === "video";
  const embedCode = (settings.heroVideoEmbedCode || "").trim();
  const desktopSource = resolveHeroVideo(settings.heroBackgroundVideo || "");
  const mobileSource = resolveHeroVideo(settings.heroBackgroundVideoMobile || settings.heroBackgroundVideo || "");
  const videoFit = resolveVideoFit(settings.heroVideoFit || "auto", settings.heroVideoAspect || "");

  const productGroups = (groups as any[])
    .map((g) => ({ name: String(g.productGroup || "").trim(), count: g?._count?._all || 0 }))
    .filter((g) => g.name);

  return (
    <div className="relative min-h-screen overflow-hidden">
      <div className="absolute inset-0 z-0">
        {isVideo && (embedCode || desktopSource || mobileSource) ? (
          <>
            {embedCode ? (
              <div className="absolute inset-0 w-full h-full overflow-hidden hero-video-embed" dangerouslySetInnerHTML={{ __html: embedCode }} />
            ) : desktopSource?.kind === "embed" ? (
              <div className="absolute inset-0 w-full h-full overflow-hidden hero-video-embed">
                <iframe src={desktopSource.src} allow="autoplay; fullscreen; encrypted-media" allowFullScreen title="Hero background video" />
              </div>
            ) : (
              <>
                {desktopSource?.kind === "file" && (
                  <video className={`absolute inset-0 h-full w-full object-center ${mobileSource?.src !== desktopSource.src ? "hidden sm:block " : ""}${videoFit === "contain" ? "object-contain" : "object-cover"}`} autoPlay muted loop playsInline preload="auto">
                    <source src={desktopSource.src} type={desktopSource.src.endsWith(".webm") ? "video/webm" : "video/mp4"} />
                  </video>
                )}
                {mobileSource?.kind === "file" && mobileSource?.src !== desktopSource?.src && (
                  <video className={`absolute inset-0 h-full w-full object-center sm:hidden ${videoFit === "contain" ? "object-contain" : "object-cover"}`} autoPlay muted loop playsInline preload="auto">
                    <source src={mobileSource.src} type={mobileSource.src.endsWith(".webm") ? "video/webm" : "video/mp4"} />
                  </video>
                )}
              </>
            )}
          </>
        ) : (
          <>
            <Image src={heroMobile} alt="ACD Architecture" fill className="object-cover object-center sm:hidden" priority unoptimized />
            <Image src={heroDesktop} alt="ACD Architecture" fill className="object-cover object-center hidden sm:block" priority unoptimized />
          </>
        )}
        <div className="absolute inset-0 bg-gradient-to-b" style={{ backgroundImage: `linear-gradient(to bottom, rgba(0,0,0,${overlayPct / 100}), rgba(0,0,0,${(overlayPct / 100) * 0.65}), rgba(0,0,0,${Math.min(1, (overlayPct / 100) * 1.4)}))` }} />
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-transparent to-black/70" />
      </div>

      <div className="relative z-10 flex min-h-screen flex-col">
        <div className="flex-1 flex flex-col items-center justify-center px-6 text-center space-y-10">
          <div className="space-y-4 max-w-3xl">
            <p className="text-xs uppercase tracking-[0.4em] text-slate-300">Kiến Trúc &amp; Nội Thất Thượng Lưu</p>
            <h1 className="font-display font-extrabold text-5xl sm:text-7xl lg:text-8xl tracking-tight text-white leading-[1.05]">
              ACD<br /><span className="text-slate-200 font-light">Architecture Studio</span>
            </h1>
            <div className="overflow-hidden whitespace-nowrap max-w-3xl mx-auto">
              <p className="text-slate-200 text-base sm:text-lg inline-block animate-marquee">Kiến tạo không gian &amp; tài nguyên thiết kế theo phong thủy hợp mệnh</p>
            </div>
          </div>

          <div className="flex flex-wrap justify-center gap-4 w-full max-w-5xl mx-auto">
            {productGroups.map((cat) => (
              <Link key={cat.name} href={`/products?productGroup=${encodeURIComponent(cat.name)}`} className="group relative overflow-hidden rounded-2xl border border-white/10 bg-black/30 backdrop-blur-md px-5 py-6 text-center transition-all duration-500 hover:border-white/40 hover:bg-black/50 hover:-translate-y-1 hover:shadow-2xl w-[calc(50%-0.5rem)] sm:w-[calc(33.333%-0.75rem)] lg:w-[calc(20%-0.8rem)] max-w-[220px]">
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="relative space-y-2">
                  <span className="block text-[10px] uppercase tracking-widest text-slate-400 group-hover:text-slate-200 transition-colors">{cat.count} sản phẩm</span>
                  <h3 className="font-display font-semibold text-sm sm:text-base text-white group-hover:text-white transition-colors whitespace-nowrap">{cat.name}</h3>
                  <ArrowRight className="mx-auto w-4 h-4 text-slate-400 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-300" />
                </div>
              </Link>
            ))}
          </div>

          <Link href="/products" className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full border border-white/20 bg-white/5 backdrop-blur-md text-white text-xs uppercase tracking-widest font-semibold hover:bg-white/15 hover:border-white/40 transition-all duration-300">
            <span>Xem tất cả sản phẩm</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <footer className="px-6 sm:px-12 py-6 text-center text-xs text-slate-400">© {new Date().getFullYear()} ACD Architecture &amp; Interior Design Studio</footer>
      </div>
    </div>
  );
}

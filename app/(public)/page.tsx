import React from "react";
import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import { ArrowRight } from "lucide-react";

export const revalidate = 0;

export default async function HomePage() {
  const categories = await prisma.projectCategory.findMany({
    include: { _count: { select: { projects: true } } },
    orderBy: { name: "asc" },
  });

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Full-screen hero background image */}
      <div className="absolute inset-0 z-0">
        <Image
          src="https://i.pinimg.com/736x/ef/ec/58/efec58efa298d13dca0dde95e2528f20.jpg"
          alt="ACD Modern Villa Architecture"
          fill
          className="object-cover object-center"
          priority
          unoptimized
        />
        {/* Dark gradient overlays for readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/85" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-transparent to-black/70" />
      </div>

      {/* Content */}
      <div className="relative z-10 flex min-h-screen flex-col">
        {/* Top bar */}
        <header className="flex items-center justify-between px-6 sm:px-12 py-6">
          <Link href="/" className="font-display font-bold text-xl text-white tracking-widest">
            ACD ARCHITECTURE
          </Link>
          <nav className="hidden md:flex items-center gap-8 text-sm text-slate-200">
            <Link href="/projects" className="hover:text-white transition-colors">
              Dự Án
            </Link>
            <Link href="/products" className="hover:text-white transition-colors">
              Tài Nguyên
            </Link>
            <Link href="/blog" className="hover:text-white transition-colors">
              Tạp Chí
            </Link>
            <Link href="/login" className="hover:text-white transition-colors">
              Đăng Nhập
            </Link>
          </nav>
        </header>

        {/* Hero center */}
        <div className="flex-1 flex flex-col items-center justify-center px-6 text-center space-y-10">
          <div className="space-y-4 max-w-3xl">
            <p className="text-xs uppercase tracking-[0.4em] text-slate-300">
              Kiến Trúc &amp; Nội Thất Thượng Lưu
            </p>
            <h1 className="font-display font-extrabold text-5xl sm:text-7xl lg:text-8xl tracking-tight text-white leading-[1.05]">
              ACD
              <br />
              <span className="text-slate-200 font-light">Architecture Studio</span>
            </h1>
            <p className="text-slate-300 text-sm sm:text-base max-w-xl mx-auto">
              Kiến tạo công trình biệt thự, nhà phố và penthouse độc bản theo phong thủy hợp mệnh.
            </p>
          </div>

          {/* Category menu */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 w-full max-w-5xl">
            {categories.map((cat) => (
              <Link
                key={cat.id}
                href={`/projects?category=${cat.slug}`}
                className="group relative overflow-hidden rounded-2xl border border-white/10 bg-black/30 backdrop-blur-md px-5 py-6 text-center transition-all duration-500 hover:border-white/40 hover:bg-black/50 hover:-translate-y-1 hover:shadow-2xl"
              >
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="relative space-y-2">
                  <span className="block text-[10px] uppercase tracking-widest text-slate-400 group-hover:text-slate-200 transition-colors">
                    {cat._count.projects} dự án
                  </span>
                  <h3 className="font-display font-semibold text-sm sm:text-base text-white group-hover:text-white transition-colors">
                    {cat.name}
                  </h3>
                  <ArrowRight className="mx-auto w-4 h-4 text-slate-400 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-300" />
                </div>
              </Link>
            ))}
          </div>

          <Link
            href="/projects"
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full border border-white/20 bg-white/5 backdrop-blur-md text-white text-xs uppercase tracking-widest font-semibold hover:bg-white/15 hover:border-white/40 transition-all duration-300"
          >
            <span>Xem tất cả dự án</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Footer minimal */}
        <footer className="px-6 sm:px-12 py-6 text-center text-xs text-slate-400">
          © {new Date().getFullYear()} ACD Architecture &amp; Interior Design Studio
        </footer>
      </div>
    </div>
  );
}
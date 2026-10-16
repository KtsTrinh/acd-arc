"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Compass,
  Palette,
  Layers,
  Search,
} from "lucide-react";

interface ElementInfo {
  key: string;
  name: string;
  chinese: string;
  tagSlug: string;
  colors: string;
  materials: string;
  generatorRule: string; // Tương sinh
  architectureShape: string;
  direction: string;
  description: string;
  projectTitle: string;
  projectSlug: string;
  projectImage: string;
  projectDesc: string;
  gradientBadge: string;
  borderColor: string;
  accentText: string;
}

const ELEMENTS_DATA: Record<string, ElementInfo> = {
  KIM: {
    key: "KIM",
    name: "Mệnh Kim",
    chinese: "金 (Metal)",
    tagSlug: "menh-kim",
    colors: "Trắng tinh khôi, Xám bạc, Vàng ánh kim, Ánh bạch kim",
    materials: "Đá cẩm thạch trắng Carrara, Kim loại phay xước, Thép không gỉ, Kính Low-E",
    generatorRule: "Thổ sinh Kim (Đất sinh ra quặng kim loại)",
    architectureShape: "Hình khối vuông vức, đường vòm cong bán nguyệt và chi tiết khúc chiết",
    direction: "Tây, Tây Bắc, Đông Bắc và Tây Nam",
    description:
      "Gia chủ mệnh Kim đại diện cho sự kiên định, sắc sảo và thanh khiết. Kiến trúc ACD tối ưu các bề mặt vật liệu sáng bóng, phản quang tinh tế cùng các đường nét kỷ hà mạch lạc, tạo nên vẻ đẹp sang trọng quyền uy và trường khí sáng lạn.",
    projectTitle: "The Aurelia White Marble Villa",
    projectSlug: "the-aurelia-white-marble-villa",
    projectImage: "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=1600&q=80",
    projectDesc:
      "Biệt thự phong cách Minimalist Luxury với đá cẩm thạch trắng Carrara, chi tiết kim loại sâm panh và đường vòm bán nguyệt.",
    gradientBadge: "from-slate-200 to-amber-200 text-slate-950",
    borderColor: "border-slate-400/50",
    accentText: "text-slate-200",
  },
  MOC: {
    key: "MOC",
    name: "Mệnh Mộc",
    chinese: "木 (Wood)",
    tagSlug: "menh-moc",
    colors: "Xanh lá cây nhiệt đới, Xanh lam ngọc, Nâu gỗ trầm",
    materials: "Gỗ Teak tự nhiên, Tre ép khối biến tính, Thảm thực vật xanh, Sỏi tự nhiên",
    generatorRule: "Thủy sinh Mộc (Nước nuôi dưỡng cỏ cây sinh sôi)",
    architectureShape: "Hình khối chữ nhật đứng, các hệ lam chắn nắng vươn cao, giếng trời đón sáng",
    direction: "Đông, Đông Nam và Nam",
    description:
      "Mệnh Mộc là biểu tượng của sự sinh sôi, sức sống bền bỉ và sự hòa ái. Không gian kiến trúc hòa quyện thiên nhiên với vườn giếng trời, hồ nước tuần hoàn và chất cảm gỗ thô mộc mang lại tâm trí thư thái tuyệt đối.",
    projectTitle: "Zenith Courtyard Residence",
    projectSlug: "zenith-courtyard-residence",
    projectImage: "https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=1600&q=80",
    projectDesc:
      "Công trình nhiệt đới ngập tràn sinh khí với gỗ teak tự nhiên, vườn giếng trời xanh mát và giải pháp đón gió tự nhiên.",
    gradientBadge: "from-emerald-400 to-teal-500 text-thuy-950",
    borderColor: "border-emerald-500/50",
    accentText: "text-emerald-400",
  },
  THUY: {
    key: "THUY",
    name: "Mệnh Thủy",
    chinese: "水 (Water)",
    tagSlug: "menh-thuy",
    colors: "Xanh đại dương thẳm, Đen obsidian, Xanh navy, Ánh bạc",
    materials: "Kính phản chiếu nước, Đá bazan đen, Nước sinh thái, Bê tông bóng",
    generatorRule: "Kim sinh Thủy (Kim loại nóng chảy tạo dòng nước)",
    architectureShape: "Hình khối uốn lượn mềm mại, hồ nước tràn viền, bể bơi vô cực",
    direction: "Bắc, Tây và Tây Bắc",
    description:
      "Mệnh Thủy đại diện cho trí tuệ uyên bác, dòng chảy vô tận và sự linh hoạt. ACD Studio ứng dụng mặt nước tĩnh làm gương soi nhân đôi kiến trúc, kết hợp phông nền đen obsidian huyền bí để đón nhận vượng khí dồi dào.",
    projectTitle: "The Aqua Horizon Villa",
    projectSlug: "the-aqua-horizon-villa",
    projectImage: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1600&q=80",
    projectDesc:
      "Biệt thự nghỉ dưỡng đương đại hòa quyện yếu tố nước phong thủy và đường nét tối giản bên bờ vịnh.",
    gradientBadge: "from-thuy-300 to-aqua-400 text-thuy-950",
    borderColor: "border-thuy-400/50",
    accentText: "text-thuy-400",
  },
  HOA: {
    key: "HOA",
    name: "Mệnh Hỏa",
    chinese: "火 (Fire)",
    tagSlug: "menh-hoa",
    colors: "Đỏ đất, Cam đất ấm áp, Tím mận, Điểm xuyết xanh lá cây",
    materials: "Gỗ ấm, Gạch gốm nung, Kim loại sơn nhiệt, Đèn trang trí nghệ thuật",
    generatorRule: "Mộc sinh Hỏa (Cây cối tiếp thêm lửa năng lượng)",
    architectureShape: "Hình khối vát chóp năng động, mái dốc nghệ thuật, khoảng thông tầng cao",
    direction: "Nam, Đông và Đông Nam",
    description:
      "Mệnh Hỏa tượng trưng cho nhiệt huyết bùng nổ, sự sáng tạo và năng lượng danh vọng. Thiết kế khai thác ánh sáng tự nhiên gián tiếp tràn ngập, kết hợp lam gỗ chắn nắng hiện đại tạo nên không gian rực rỡ nhưng vẫn đối lưu vi khí hậu mát mẻ.",
    projectTitle: "The Solarium Light Pavilion",
    projectSlug: "the-solarium-light-pavilion",
    projectImage: "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?w=1600&q=80",
    projectDesc:
      "Biệt thự đón sáng tự nhiên rực rỡ với hệ lam gỗ chắn nắng vát chéo nghệ thuật và không gian thông tầng thoáng đãng.",
    gradientBadge: "from-amber-500 to-red-500 text-white",
    borderColor: "border-amber-500/50",
    accentText: "text-amber-400",
  },
  THO: {
    key: "THO",
    name: "Mệnh Thổ",
    chinese: "土 (Earth)",
    tagSlug: "menh-tho",
    colors: "Nâu đất, Vàng cát, Cam đất mộc, Điểm nhấn đỏ nhẹ",
    materials: "Đá sa thạch, Đá bazan thô chẻ, Gạch mộc nung, Đất nén rammed earth",
    generatorRule: "Hỏa sinh Thổ (Lửa thiêu đốt vạn vật biến thành tro đất)",
    architectureShape: "Hình khối ngang trải rộng bám đất, kiến trúc kiên cố và vững chãi",
    direction: "Đông Bắc, Tây Nam và Nam",
    description:
      "Mệnh Thổ là cội nguồn của sự bao dung, nuôi dưỡng và bền vững theo năm tháng. ACD kiến tạo các công trình bám sát địa hình đồi dốc, sử dụng đá sa thạch thô mộc và gạch nung truyền thống để mang lại cảm giác bình yên, trường tồn.",
    projectTitle: "Terra Basalt Stone Villa",
    projectSlug: "terra-basalt-stone-villa",
    projectImage: "https://images.unsplash.com/photo-1600573472550-8090b5e0745e?w=1600&q=80",
    projectDesc:
      "Biệt thự đá sa thạch và bazan tự nhiên bám đất vững chãi, tone màu nâu đất mộc mạc và trường tồn với thời gian.",
    gradientBadge: "from-amber-600 to-yellow-600 text-white",
    borderColor: "border-yellow-600/50",
    accentText: "text-yellow-400",
  },
};

// Quick helper to calculate Destiny from birth year (Can Chi Ngũ Hành)
function calculateMenhByYear(year: number): string | null {
  if (year < 1920 || year > 2030) return null;
  // Menh map by Can Chi: Can (Giap/At=1, Binh/Dinh=2, Mau/Ky=3, Canh/Tan=4, Nham/Quy=5)
  // Chi (Ty/Suu/Ngo/Mui=0, Dan/Mao/Than/Dau=1, Thin/Ty/Tuat/Hoi=2)
  const canMap = [4, 4, 5, 5, 1, 1, 2, 2, 3, 3]; // index = year % 10 (0=Canh, 1=Tan, 2=Nham, 3=Quy...)
  const canVal = canMap[year % 10];

  const chiMod = (year - 4) % 12;
  let chiVal = 0;
  if ([0, 1, 6, 7].includes(chiMod)) chiVal = 0;
  else if ([2, 3, 8, 9].includes(chiMod)) chiVal = 1;
  else chiVal = 2;

  let total = canVal + chiVal;
  if (total > 5) total -= 5;

  const menhResult: Record<number, string> = {
    1: "KIM",
    2: "THUY",
    3: "HOA",
    4: "THO",
    5: "MOC",
  };
  return menhResult[total] || "THUY";
}

export default function FengShuiDestinyExplorer() {
  const [selectedKey, setSelectedKey] = useState<string>("THUY");
  const [birthYearInput, setBirthYearInput] = useState<string>("");
  const [calculatorMessage, setCalculatorMessage] = useState<string>("");

  const activeElement = ELEMENTS_DATA[selectedKey] || ELEMENTS_DATA.THUY;

  const handleCalculateYear = (e: React.FormEvent) => {
    e.preventDefault();
    const y = parseInt(birthYearInput, 10);
    if (!y || y < 1930 || y > 2026) {
      setCalculatorMessage("Vui lòng nhập năm sinh hợp lệ (ví dụ: 1988, 1990, 1996...)");
      return;
    }
    const resultKey = calculateMenhByYear(y);
    if (resultKey && ELEMENTS_DATA[resultKey]) {
      setSelectedKey(resultKey);
      setCalculatorMessage(`Năm sinh ${y} của bạn thuộc ${ELEMENTS_DATA[resultKey].name}!`);
    }
  };

  return (
    <div className="space-y-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-thuy-800 pb-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-thuy-800/80 border border-thuy-700 text-thuy-300 text-xs">
            <Sparkles className="w-3.5 h-3.5 text-thuy-400" />
            <span>Ngũ Hành Tương Sinh: Kim • Mộc • Thủy • Hỏa • Thổ</span>
          </div>
          <h2 className="font-display font-bold text-3xl sm:text-5xl text-white">
            Kiến Trúc & Phong Thủy Hợp Mệnh
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 max-w-2xl font-light">
            Mỗi khách hàng mang một bản mệnh riêng. ACD Studio nghiên cứu và cá nhân hóa giải pháp
            hình khối, ánh sáng và vật liệu tương sinh, mang lại tài lộc và sự an yên trường cửu.
          </p>
        </div>

        {/* Quick Year Lookup widget */}
        <form
          onSubmit={handleCalculateYear}
          className="p-3 rounded-2xl bg-thuy-850 border border-thuy-750 flex flex-col sm:flex-row items-center gap-2"
        >
          <div className="text-left w-full sm:w-auto">
            <span className="text-[10px] text-slate-400 block font-medium">
              Tra cứu nhanh bản mệnh:
            </span>
            <input
              type="number"
              placeholder="Nhập năm sinh (1990)..."
              value={birthYearInput}
              onChange={(e) => setBirthYearInput(e.target.value)}
              className="px-3 py-1.5 rounded-lg bg-thuy-900 border border-thuy-700 text-xs text-white placeholder-slate-500 w-full sm:w-44 focus:outline-none focus:border-thuy-400"
            />
          </div>
          <button
            type="submit"
            className="w-full sm:w-auto px-4 py-2 rounded-xl bg-thuy-400 text-thuy-950 font-bold text-xs uppercase hover:brightness-110 shadow-glow-cyan transition-all flex items-center justify-center gap-1.5 mt-1 sm:mt-0"
          >
            <Search className="w-3.5 h-3.5" />
            <span>Tra Cứu</span>
          </button>
        </form>
      </div>

      {calculatorMessage && (
        <div className="p-3 rounded-xl bg-thuy-850/90 border border-thuy-500 text-thuy-300 text-xs text-center font-medium animate-in fade-in">
          {calculatorMessage}
        </div>
      )}

      {/* 5 Element Navigation Tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {Object.values(ELEMENTS_DATA).map((item) => {
          const isSelected = selectedKey === item.key;
          return (
            <button
              key={item.key}
              onClick={() => {
                setSelectedKey(item.key);
                setCalculatorMessage("");
              }}
              className={`p-4 rounded-2xl border-2 transition-all flex flex-col items-center justify-center text-center gap-1.5 ${
                isSelected
                  ? `bg-thuy-800 ${item.borderColor} shadow-card-dark scale-[1.02]`
                  : "bg-thuy-850/70 border-thuy-750 hover:border-thuy-600 opacity-75 hover:opacity-100"
              }`}
            >
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-gradient-to-r ${item.gradientBadge}`}>
                {item.key}
              </span>
              <h3 className="font-display font-bold text-base text-white">{item.name}</h3>
              <span className="text-[11px] text-slate-400">{item.chinese}</span>
            </button>
          );
        })}
      </div>

      {/* Element Detail Showcase Card */}
      <div className="rounded-3xl bg-thuy-850 border border-thuy-750 p-6 sm:p-10 shadow-2xl relative overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left info (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <span className={`px-3 py-1 rounded-full text-xs font-bold bg-gradient-to-r ${activeElement.gradientBadge}`}>
                  {activeElement.name} • {activeElement.chinese}
                </span>
                <span className="text-xs text-slate-400 font-medium">
                  Nguyên lý: <b className="text-white">{activeElement.generatorRule}</b>
                </span>
              </div>

              <h3 className="font-display font-bold text-2xl sm:text-4xl text-white">
                Giải Pháp Kiến Trúc Cho Gia Chủ {activeElement.name}
              </h3>

              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-light">
                {activeElement.description}
              </p>
            </div>

            {/* Spec grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs pt-2">
              <div className="p-3.5 rounded-xl bg-thuy-900 border border-thuy-750 space-y-1">
                <div className="flex items-center gap-1.5 text-slate-400">
                  <Palette className="w-3.5 h-3.5 text-thuy-400" />
                  <span className="font-semibold text-white">Màu Sắc Tương Sinh:</span>
                </div>
                <p className="text-slate-300 text-[11px] leading-snug">{activeElement.colors}</p>
              </div>

              <div className="p-3.5 rounded-xl bg-thuy-900 border border-thuy-750 space-y-1">
                <div className="flex items-center gap-1.5 text-slate-400">
                  <Layers className="w-3.5 h-3.5 text-thuy-400" />
                  <span className="font-semibold text-white">Vật Liệu Khuyên Dùng:</span>
                </div>
                <p className="text-slate-300 text-[11px] leading-snug">{activeElement.materials}</p>
              </div>

              <div className="p-3.5 rounded-xl bg-thuy-900 border border-thuy-750 space-y-1">
                <div className="flex items-center gap-1.5 text-slate-400">
                  <Compass className="w-3.5 h-3.5 text-thuy-400" />
                  <span className="font-semibold text-white">Hướng Hợp Khí:</span>
                </div>
                <p className="text-slate-300 text-[11px] leading-snug">{activeElement.direction}</p>
              </div>

              <div className="p-3.5 rounded-xl bg-thuy-900 border border-thuy-750 space-y-1">
                <div className="flex items-center gap-1.5 text-slate-400">
                  <Sparkles className="w-3.5 h-3.5 text-thuy-400" />
                  <span className="font-semibold text-white">Hình Khối Kiến Trúc:</span>
                </div>
                <p className="text-slate-300 text-[11px] leading-snug">{activeElement.architectureShape}</p>
              </div>
            </div>

            <div className="pt-2">
              <Link
                href={`/projects?search=${encodeURIComponent(activeElement.name)}`}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-thuy-400 text-thuy-950 font-bold text-xs uppercase hover:brightness-110 shadow-glow-cyan transition-all"
              >
                <span>Xem Các Dự Án Cho {activeElement.name}</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* Right project showcase (5 cols) */}
          <div className="lg:col-span-5 space-y-3">
            <div className="relative aspect-[4/3] rounded-2xl overflow-hidden border border-thuy-700 bg-thuy-950 shadow-2xl group">
              <Image
                src={activeElement.projectImage}
                alt={activeElement.projectTitle}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-700"
                unoptimized
              />
              <div className="absolute inset-0 bg-gradient-to-t from-thuy-950 via-thuy-950/40 to-transparent" />
              <div className="absolute bottom-4 left-4 right-4 p-4 rounded-xl bg-thuy-950/85 backdrop-blur-md border border-thuy-700/80 space-y-1">
                <span className="text-[10px] text-thuy-400 uppercase tracking-widest font-bold">
                  Công Trình Tiêu Biểu Cho {activeElement.name}
                </span>
                <h4 className="font-display font-bold text-sm text-white">
                  {activeElement.projectTitle}
                </h4>
                <p className="text-[11px] text-slate-300 line-clamp-2">
                  {activeElement.projectDesc}
                </p>
                <Link
                  href={`/projects/${activeElement.projectSlug}`}
                  className="inline-flex items-center gap-1 text-[11px] text-thuy-400 hover:text-white font-semibold pt-1"
                >
                  <span>Xem hồ sơ công trình</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ACD Architecture & Design | Kiến Trúc Hợp Mệnh Ngũ Hành & Nội Thất Thượng Lưu",
  description:
    "ACD Studio - Đơn vị thiết kế kiến trúc biệt thự, nhà phố, penthouse và nội thất cao cấp theo phong thủy hợp mệnh (Kim - Mộc - Thủy - Hỏa - Thổ). Cung cấp hệ sinh thái tài nguyên bản vẽ CAD, model 3D chuyên nghiệp.",
  keywords: [
    "kiến trúc biệt thự",
    "thiết kế nội thất",
    "nhà phố hiện đại",
    "phong thủy hợp mệnh",
    "phong thủy ngũ hành",
    "mệnh kim",
    "mệnh mộc",
    "mệnh thủy",
    "mệnh hỏa",
    "mệnh thổ",
    "bản vẽ autocad",
    "model 3d kiến trúc",
    "acd architecture",
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Outfit:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen bg-thuy-900 text-slate-100 antialiased selection:bg-thuy-400 selection:text-thuy-950">
        {children}
      </body>
    </html>
  );
}


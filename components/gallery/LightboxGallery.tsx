"use client";

import React, { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { X, ChevronLeft, ChevronRight, Maximize2, Download } from "lucide-react";

interface GalleryImage {
  id: string;
  url: string;
  alt?: string | null;
  filename: string;
}

interface LightboxGalleryProps {
  images: GalleryImage[];
  projectTitle: string;
}

export default function LightboxGallery({ images, projectTitle }: LightboxGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (selectedIndex === null) return;

      if (e.key === "Escape") {
        setSelectedIndex(null);
      } else if (e.key === "ArrowLeft") {
        setSelectedIndex((prev) => (prev! > 0 ? prev! - 1 : images.length - 1));
      } else if (e.key === "ArrowRight") {
        setSelectedIndex((prev) => (prev! < images.length - 1 ? prev! + 1 : 0));
      }
    },
    [selectedIndex, images.length]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  if (!images || images.length === 0) return null;

  return (
    <div className="space-y-6">
      {/* Gallery Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {images.map((img, idx) => (
          <div
            key={img.id || idx}
            onClick={() => setSelectedIndex(idx)}
            className="group relative aspect-[4/3] rounded-2xl overflow-hidden bg-thuy-950 border border-thuy-750/70 cursor-pointer transition-all duration-300 hover:border-thuy-400 hover:shadow-card-dark"
          >
            <Image
              src={img.url}
              alt={img.alt || projectTitle}
              fill
              className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
              unoptimized
            />
            {/* Hover overlay with water glow effect */}
            <div className="absolute inset-0 bg-gradient-to-t from-thuy-950/90 via-thuy-950/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-5">
              <div className="flex items-center justify-between">
                <span className="text-xs text-thuy-300 font-medium">
                  Xem ảnh #{idx + 1}
                </span>
                <div className="p-2 rounded-full bg-thuy-400/20 text-thuy-300 border border-thuy-400/40">
                  <Maximize2 className="w-4 h-4" />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Fullscreen Lightbox Modal */}
      {selectedIndex !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-thuy-950/95 backdrop-blur-xl animate-in fade-in duration-200">
          {/* Header Bar */}
          <div className="absolute top-0 left-0 right-0 p-6 flex items-center justify-between z-10 bg-gradient-to-b from-thuy-950 to-transparent">
            <div className="text-left">
              <h3 className="text-sm font-semibold text-white">{projectTitle}</h3>
              <p className="text-xs text-slate-400">
                Hình ảnh {selectedIndex + 1} / {images.length}
              </p>
            </div>
            <button
              onClick={() => setSelectedIndex(null)}
              className="p-2.5 rounded-full bg-thuy-800/80 hover:bg-thuy-700 text-slate-300 hover:text-white border border-thuy-700 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Previous Button */}
          <button
            onClick={() =>
              setSelectedIndex((prev) => (prev! > 0 ? prev! - 1 : images.length - 1))
            }
            className="absolute left-6 z-10 p-3 rounded-full bg-thuy-900/80 hover:bg-thuy-800 text-white border border-thuy-700 transition-all hover:scale-110"
            title="Ảnh trước (Phím mũi tên trái)"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>

          {/* Main Focused Image */}
          <div className="relative w-full max-w-5xl h-[75vh] mx-4 flex items-center justify-center">
            <Image
              src={images[selectedIndex].url}
              alt={images[selectedIndex].alt || projectTitle}
              fill
              className="object-contain"
              priority
              unoptimized
            />
          </div>

          {/* Next Button */}
          <button
            onClick={() =>
              setSelectedIndex((prev) => (prev! < images.length - 1 ? prev! + 1 : 0))
            }
            className="absolute right-6 z-10 p-3 rounded-full bg-thuy-900/80 hover:bg-thuy-800 text-white border border-thuy-700 transition-all hover:scale-110"
            title="Ảnh kế tiếp (Phím mũi tên phải)"
          >
            <ChevronRight className="w-6 h-6" />
          </button>

          {/* Bottom Thumbnails Strip */}
          <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-2 px-4 overflow-x-auto py-2">
            {images.map((thumb, idx) => (
              <button
                key={thumb.id || idx}
                onClick={() => setSelectedIndex(idx)}
                className={`relative w-14 h-14 rounded-lg overflow-hidden border-2 transition-all flex-shrink-0 ${
                  selectedIndex === idx
                    ? "border-thuy-400 scale-105 shadow-glow-cyan"
                    : "border-transparent opacity-50 hover:opacity-100"
                }`}
              >
                <Image
                  src={thumb.url}
                  alt="thumbnail"
                  fill
                  className="object-cover"
                  unoptimized
                />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}


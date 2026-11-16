"use client";

import React, { useState } from "react";
import { Phone } from "lucide-react";

function normalizePhone(phone: string) {
  const trimmed = (phone || "").trim();
  if (!trimmed) return "";
  const hasPlus = trimmed.startsWith("+");
  const digits = trimmed.replace(/\D/g, "");
  if (!digits) return "";
  return hasPlus ? `+${digits}` : digits;
}

function ZaloIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" className={className} aria-hidden="true" focusable="false">
      <rect x="6" y="6" width="36" height="36" rx="10" fill="#fff" />
      <text
        x="24"
        y="29"
        textAnchor="middle"
        fontSize="11"
        fontWeight="800"
        fill="#0068FF"
        fontFamily="Arial, Helvetica, sans-serif"
      >
        Zalo
      </text>
    </svg>
  );
}

export default function FloatingContact({
  phone,
  zalo,
}: {
  phone?: string | null;
  zalo?: string | null;
}) {
  const [openPhone, setOpenPhone] = useState(false);
  const [openZalo, setOpenZalo] = useState(false);

  const phoneDisplay = (phone || "").trim();
  const zaloDisplay = (zalo || phone || "").trim();
  const tel = normalizePhone(phoneDisplay);
  const zaloNumber = normalizePhone(zaloDisplay);
  if (!tel && !zaloNumber) return null;

  return (
    <div className="fixed right-4 bottom-6 sm:right-6 sm:bottom-8 z-50 flex flex-col items-end gap-3">
      {tel && (
        <div className="flex items-center justify-end gap-2">
          <a
            href={`tel:${tel}`}
            tabIndex={openPhone ? 0 : -1}
            aria-hidden={!openPhone}
            className={`px-3 py-2 rounded-full bg-thuy-900/95 border border-emerald-400/40 text-white text-xs sm:text-sm font-semibold shadow-lg shadow-emerald-900/30 whitespace-nowrap transition-all duration-300 ease-out ${
              openPhone
                ? "opacity-100 translate-x-0 max-w-[220px] scale-100"
                : "opacity-0 translate-x-3 max-w-0 scale-95 pointer-events-none overflow-hidden"
            }`}
          >
            {phoneDisplay}
          </a>
          <button
            type="button"
            onClick={() => setOpenPhone((v) => !v)}
            aria-label="Gọi hotline"
            aria-expanded={openPhone}
            title="Hotline"
            className="group relative flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 text-white shadow-lg shadow-emerald-900/40 ring-1 ring-white/20 transition-all duration-300 ease-out hover:scale-110 hover:shadow-emerald-500/30"
          >
            <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-30 animate-ping" />
            <Phone className="relative h-5 w-5 sm:h-6 sm:w-6 animate-[float-shake_1.8s_ease-in-out_infinite]" />
          </button>
        </div>
      )}
      {zaloNumber && (
        <div className="flex items-center justify-end gap-2">
          <a
            href={`https://zalo.me/${zaloNumber}`}
            target="_blank"
            rel="noopener noreferrer"
            tabIndex={openZalo ? 0 : -1}
            aria-hidden={!openZalo}
            className={`px-3 py-2 rounded-full bg-thuy-900/95 border border-[#0068FF]/50 text-white text-xs sm:text-sm font-semibold shadow-lg shadow-blue-900/30 whitespace-nowrap transition-all duration-300 ease-out ${
              openZalo
                ? "opacity-100 translate-x-0 max-w-[220px] scale-100"
                : "opacity-0 translate-x-3 max-w-0 scale-95 pointer-events-none overflow-hidden"
            }`}
          >
            {zaloDisplay}
          </a>
          <button
            type="button"
            onClick={() => setOpenZalo((v) => !v)}
            aria-label="Zalo"
            aria-expanded={openZalo}
            title="Zalo"
            className="group relative flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-full bg-[#0068FF] text-white shadow-lg shadow-blue-900/40 ring-1 ring-white/20 transition-all duration-300 ease-out hover:scale-110 hover:shadow-blue-500/30"
          >
            <span className="absolute inline-flex h-full w-full rounded-full bg-[#0068FF] opacity-25 animate-ping" />
            <ZaloIcon className="relative h-8 w-8 sm:h-9 sm:w-9 animate-[float-shake_1.8s_ease-in-out_infinite]" />
          </button>
        </div>
      )}
      <style jsx>{`
        @keyframes float-shake {
          0%,
          100% {
            transform: rotate(0deg);
          }
          10% {
            transform: rotate(-12deg);
          }
          20% {
            transform: rotate(12deg);
          }
          30% {
            transform: rotate(-10deg);
          }
          40% {
            transform: rotate(10deg);
          }
          50% {
            transform: rotate(-6deg);
          }
          60% {
            transform: rotate(6deg);
          }
          70% {
            transform: rotate(0deg);
          }
        }
      `}</style>
    </div>
  );
}

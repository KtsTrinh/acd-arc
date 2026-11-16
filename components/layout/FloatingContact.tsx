"use client";

import React from "react";
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
      <rect x="2" y="2" width="44" height="44" rx="14" fill="currentColor" />
      <path
        d="M14.2 16.2h19.6c.9 0 1.4 1 .9 1.8L23.1 33.2h10.2c.8 0 1.5.7 1.5 1.5s-.7 1.5-1.5 1.5H13.7c-.9 0-1.4-1-.9-1.8L24.4 19H14.2c-.8 0-1.5-.7-1.5-1.5s.7-1.3 1.5-1.3Z"
        fill="#fff"
      />
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
  const phoneDisplay = (phone || "").trim();
  const zaloDisplay = (zalo || phone || "").trim();
  const tel = normalizePhone(phoneDisplay);
  const zaloNumber = normalizePhone(zaloDisplay);
  if (!tel && !zaloNumber) return null;

  return (
    <div className="fixed right-4 bottom-6 sm:right-6 sm:bottom-8 z-50 flex flex-col items-end gap-3">
      {tel && (
        <a
          href={`tel:${tel}`}
          aria-label={`Gọi hotline ${phoneDisplay}`}
          className="group flex items-center gap-2"
        >
          <span className="px-3 py-1.5 rounded-full bg-thuy-900/95 border border-emerald-400/40 text-white text-xs sm:text-sm font-semibold shadow-lg shadow-emerald-900/30 whitespace-nowrap">
            {phoneDisplay}
          </span>
          <span className="relative flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 text-white shadow-lg shadow-emerald-900/40 ring-1 ring-white/20 transition-transform group-hover:scale-110">
            <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-30 animate-ping" />
            <Phone className="relative h-5 w-5 sm:h-6 sm:w-6 animate-[float-shake_1.8s_ease-in-out_infinite]" />
          </span>
        </a>
      )}
      {zaloNumber && (
        <a
          href={`https://zalo.me/${zaloNumber}`}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`Chat Zalo ${zaloDisplay}`}
          className="group flex items-center gap-2"
        >
          <span className="px-3 py-1.5 rounded-full bg-thuy-900/95 border border-[#0068FF]/50 text-white text-xs sm:text-sm font-semibold shadow-lg shadow-blue-900/30 whitespace-nowrap">
            {zaloDisplay}
          </span>
          <span className="relative flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-full bg-[#0068FF] text-white shadow-lg shadow-blue-900/40 ring-1 ring-white/20 transition-transform group-hover:scale-110">
            <span className="absolute inline-flex h-full w-full rounded-full bg-[#0068FF] opacity-25 animate-ping" />
            <ZaloIcon className="relative h-7 w-7 sm:h-8 sm:w-8 animate-[float-shake_1.8s_ease-in-out_infinite]" />
          </span>
        </a>
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

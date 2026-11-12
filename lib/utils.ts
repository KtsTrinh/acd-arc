import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatVND(amount: number): string {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(amount);
}

export function formatDate(date: Date | string): string {
  const d = new Date(date);
  return d.toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export function formatDateTime(date: Date | string): string {
  const d = new Date(date);
  return d.toLocaleString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function slugify(str: string): string {
  return str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[đĐ]/g, "d")
    .replace(/([^0-9a-z-\s])/g, "")
    .replace(/(\s+)/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function generateOrderNumber(): string {
  const randomNum = Math.floor(10000 + Math.random() * 90000);
  return `ACD-${randomNum}`;
}

const DONVI = ["", "một", "hai", "ba", "bốn", "năm", "sáu", "bảy", "tám", "chín"];

function docHangTram(tram: number, chuc: number, donvi: number): string {
  let s = "";
  if (tram > 0) {
    s += DONVI[tram] + " trăm";
    if (chuc === 0 && donvi === 0) return s;
    if (chuc === 0) {
      s += " linh " + DONVI[donvi];
      return s;
    }
    if (chuc === 1) {
      s += donvi === 5 ? " mười lăm" : " mười" + (donvi > 0 ? " " + DONVI[donvi] : "");
      return s;
    }
    s += " " + DONVI[chuc] + " mươi";
    if (donvi === 1) s += " mốt";
    else if (donvi === 5) s += " lăm";
    else if (donvi > 0) s += " " + DONVI[donvi];
    return s;
  }
  if (chuc === 0) return donvi > 0 ? DONVI[donvi] : "";
  if (chuc === 1) {
    s += donvi === 5 ? "mười lăm" : "mười" + (donvi > 0 ? " " + DONVI[donvi] : "");
    return s;
  }
  s += DONVI[chuc] + " mươi";
  if (donvi === 1) s += " mốt";
  else if (donvi === 5) s += " lăm";
  else if (donvi > 0) s += " " + DONVI[donvi];
  return s;
}

export function numberToWordsVN(num: number): string {
  if (num === 0) return "không";
  if (num < 0) return "âm " + numberToWordsVN(-num);
  const ty = Math.floor(num / 1_000_000_000);
  const trieu = Math.floor((num % 1_000_000_000) / 1_000_000);
  const nghin = Math.floor((num % 1_000_000) / 1_000);
  const don = num % 1_000;
  let s = "";
  const append = (group: number, label: string) => {
    if (group > 0) {
      if (s) s += " ";
      s += docHangTram(Math.floor(group / 100), Math.floor((group % 100) / 10), group % 10) + " " + label;
    }
  };
  append(ty, "tỷ");
  append(trieu, "triệu");
  append(nghin, "nghìn");
  if (don > 0) {
    if (s) s += " ";
    s += docHangTram(Math.floor(don / 100), Math.floor((don % 100) / 10), don % 10);
  } else if (!s) {
    s = "không";
  }
  return s;
}

export function formatPriceDot(value: string): string {
  const digits = value.replace(/\D/g, "");
  if (!digits) return "";
  return digits.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

export function parsePriceDot(value: string): number | null {
  const digits = value.replace(/\D/g, "");
  if (!digits) return null;
  return parseInt(digits, 10);
}


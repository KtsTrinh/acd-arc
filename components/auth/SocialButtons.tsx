"use client";

import { Loader2 } from "lucide-react";
import { useProviders } from "./useProviders";

export default function SocialButtons({
  text,
  from,
}: {
  text: string;
  from?: string | null;
}) {
  const providers = useProviders();

  const start = (provider: "google" | "facebook") => {
    const query = from ? `?from=${encodeURIComponent(from)}` : "";
    window.location.href = `/api/auth/oauth/${provider}${query}`;
  };

  const startFirebase = async () => {
    try {
      const { getFirebaseAuth } = await import("@/lib/firebase");
      const { signInWithPopup, GoogleAuthProvider } = await import(
        "firebase/auth"
      );
      const auth = await getFirebaseAuth();
      if (!auth) {
        alert("Firebase chưa được cấu hình. Vui lòng liên hệ quản trị viên.");
        return;
      }
      const result = await signInWithPopup(auth, new GoogleAuthProvider());
      const idToken = await result.user.getIdToken();
      const res = await fetch("/api/auth/firebase", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Đăng nhập Firebase thất bại.");
      window.location.href = from || "/account";
    } catch (err: any) {
      console.error("Firebase sign-in error:", err);
      alert(err?.message || "Đăng nhập Firebase thất bại.");
    }
  };

  const items = [
    {
      id: "google" as const,
      label: "Google",
      configured: providers.google,
      icon: (
        <svg className="w-4 h-4" viewBox="0 0 24 24" aria-hidden="true">
          <path
            fill="#EA4335"
            d="M12 10.2v3.9h5.5c-.24 1.4-1.6 4.1-5.5 4.1-3.3 0-6-2.7-6-6.1S8.7 6 12 6c1.9 0 3.1.8 3.8 1.5l2.6-2.5C16.9 3.3 14.7 2.5 12 2.5 6.8 2.5 2.7 6.6 2.7 11.8S6.8 21 12 21c5.9 0 9.8-4.1 9.8-9.9 0-.66-.07-1.2-.16-1.7H12z"
          />
        </svg>
      ),
    },
    {
      id: "facebook" as const,
      label: "Facebook",
      configured: providers.facebook,
      icon: (
        <svg className="w-4 h-4" viewBox="0 0 24 24" aria-hidden="true">
          <path
            fill="#1877F2"
            d="M22 12a10 10 0 10-11.6 9.9v-7H7.9V12h2.5V9.8c0-2.5 1.5-3.9 3.8-3.9 1.1 0 2.2.2 2.2.2v2.4h-1.2c-1.2 0-1.6.8-1.6 1.6V12h2.7l-.4 2.9h-2.3v7A10 10 0 0022 12z"
          />
        </svg>
      ),
    },
    {
      id: "firebase" as const,
      label: "Firebase",
      configured: providers.firebase,
      icon: (
        <svg className="w-4 h-4" viewBox="0 0 24 24" aria-hidden="true">
          <path fill="#FFCA28" d="M3.89 13.91l6.68-11.55a.5.5 0 01.86 0l2.3 3.99-5.9 10.22-3.94-2.66z" />
          <path fill="#FFA000" d="M3.89 13.91l-1.5 2.6a.5.5 0 00.43.75h18.36a.5.5 0 00.43-.75l-1.5-2.6H3.89z" />
          <path fill="#F57C00" d="M13.73 6.35l2.3 3.99 4.08 6.22-6.38-10.21z" />
        </svg>
      ),
    },
  ];

  const visible = items.filter((item) => item.configured);

  if (providers.loading || !visible.length) return null;

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-3">
        <span className="h-px flex-1 bg-thuy-700" />
        <span className="text-[11px] uppercase tracking-wider text-slate-500">
          Hoặc
        </span>
        <span className="h-px flex-1 bg-thuy-700" />
      </div>
      {visible.map((item) => (
        <button
          key={item.id}
          type="button"
          onClick={() =>
            item.id === "firebase" ? startFirebase() : start(item.id as any)
          }
          className="w-full flex items-center justify-center gap-2.5 py-2.5 rounded-xl bg-thuy-900 border border-thuy-700 hover:border-thuy-500 text-xs font-medium text-thuy-200 transition-colors"
        >
          {item.icon}
          {text} với {item.label}
        </button>
      ))}
    </div>
  );
}

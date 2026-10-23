"use client";

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

  const items = [
    {
      id: "google" as const,
      label: "Google",
      configured: providers.google,
    },
    {
      id: "facebook" as const,
      label: "Facebook",
      configured: providers.facebook,
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
          onClick={() => start(item.id)}
          className="w-full flex items-center justify-center gap-2.5 py-2.5 rounded-xl bg-thuy-900 border border-thuy-700 hover:border-thuy-500 text-xs font-medium text-thuy-200 transition-colors"
        >
          {text} với {item.label}
        </button>
      ))}
    </div>
  );
}

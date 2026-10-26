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
  ];

  const visible = items.filter((item) => item.configured);

  if (providers.loading || !visible.length) return null;

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-3">
        <span className="h-px flex-1 bg-white/10" />
        <span className="text-[11px] uppercase tracking-wider text-slate-300">
          Hoặc
        </span>
        <span className="h-px flex-1 bg-white/10" />
      </div>
      {visible.map((item) => (
        <button
          key={item.id}
          type="button"
          onClick={() => start(item.id)}
          className="w-full flex items-center justify-center gap-2.5 py-2.5 rounded-xl bg-[#112240]/80 border border-white/10 hover:border-accent hover:bg-gradient-to-r hover:from-cyan-400/10 hover:to-blue-500/10 text-xs font-medium text-white transition-all duration-300 ease-out-quart"
        >
          {item.icon}
          {text} với {item.label}
        </button>
      ))}
    </div>
  );
}

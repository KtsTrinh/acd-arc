"use client";

import React, { useState } from "react";
import { Loader2, GitBranch, CheckCircle2, AlertTriangle, RefreshCw } from "lucide-react";

const AUTO_SYNC_KEY = "acd_cms_auto_sync";

export function isAutoSyncEnabled(): boolean {
  if (typeof window === "undefined") return false;
  return window.localStorage.getItem(AUTO_SYNC_KEY) === "true";
}

export function setAutoSyncEnabled(enabled: boolean) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(AUTO_SYNC_KEY, enabled ? "true" : "false");
}

interface SyncResult {
  ok: boolean;
  message: string;
  commitUrl?: string;
  changedFiles?: string[];
}

/**
 * Đồng bộ nội dung CMS ra source code (thư mục `content/`) rồi push lên
 * GitHub — Vercel sẽ tự động deploy lại.
 */
export async function syncCmsToGithub(
  commitMessage?: string
): Promise<SyncResult> {
  try {
    const res = await fetch("/api/cms/sync", {
      method: "POST",
      headers: commitMessage
        ? { "x-cms-commit-message": commitMessage }
        : undefined,
    });
    const data = await res.json();

    if (!res.ok) {
      return {
        ok: false,
        message: data.error || "Không thể đồng bộ mã nguồn.",
      };
    }

    return {
      ok: true,
      message: data.message || "Đã đồng bộ mã nguồn lên GitHub.",
      commitUrl: data.commitUrl,
      changedFiles: data.changedFiles,
    };
  } catch (error) {
    return {
      ok: false,
      message:
        error instanceof Error ? error.message : "Không thể kết nối tới máy chủ.",
    };
  }
}

/**
 * Gọi đồng bộ tự động sau khi lưu (nếu người dùng bật). Không chặn luồng lưu.
 */
export async function autoSyncAfterSave(reason: string) {
  if (!isAutoSyncEnabled()) return;
  await syncCmsToGithub(`content: cập nhật ${reason} từ CMS`);
}

interface CmsSyncButtonProps {
  label?: string;
  className?: string;
  onSynced?: () => void;
}

export default function CmsSyncButton({
  label = "Đồng bộ mã nguồn",
  className = "",
  onSynced,
}: CmsSyncButtonProps) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SyncResult | null>(null);

  const handleSync = async () => {
    setLoading(true);
    setResult(null);
    const res = await syncCmsToGithub();
    setResult(res);
    setLoading(false);
    if (res.ok) onSynced?.();
  };

  return (
    <div className={className}>
      <button
        type="button"
        onClick={handleSync}
        disabled={loading}
        className="px-4 py-2.5 rounded-xl bg-thuy-400 text-thuy-950 font-bold text-xs uppercase tracking-wider hover:brightness-110 shadow-glow-cyan transition-all flex items-center gap-2 disabled:opacity-60"
      >
        {loading ? (
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
        ) : (
          <GitBranch className="w-3.5 h-3.5" />
        )}
        <span>{loading ? "Đang đồng bộ..." : label}</span>
      </button>

      {result && (
        <div className="mt-3 flex items-start gap-2 p-3 rounded-xl bg-thuy-900 border border-thuy-750 text-xs">
          {result.ok ? (
            <>
              <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-emerald-300">{result.message}</p>
                {result.commitUrl && (
                  <a
                    href={result.commitUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-thuy-300 underline mt-1 inline-block"
                  >
                    Xem commit trên GitHub
                  </a>
                )}
              </div>
            </>
          ) : (
            <>
              <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
              <p className="text-red-300 flex-1">{result.message}</p>
            </>
          )}
        </div>
      )}
    </div>
  );
}

interface AutoSyncToggleProps {
  onChange?: (enabled: boolean) => void;
}

export function AutoSyncToggle({ onChange }: AutoSyncToggleProps) {
  const [enabled, setEnabled] = useState(false);

  React.useEffect(() => {
    setEnabled(isAutoSyncEnabled());
  }, []);

  const toggle = () => {
    const next = !enabled;
    setEnabled(next);
    setAutoSyncEnabled(next);
    onChange?.(next);
  };

  return (
    <button
      type="button"
      onClick={toggle}
      className="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-thuy-900 border border-thuy-700 hover:border-thuy-400 transition-colors"
    >
      <RefreshCw
        className={`w-3.5 h-3.5 ${
          enabled ? "text-thuy-400 animate-spin" : "text-slate-500"
        }`}
      />
      <span className="text-xs text-slate-300">
        Tự động đồng bộ mã nguồn sau mỗi lần lưu
      </span>
      <span
        className={`ml-auto w-9 h-5 rounded-full relative transition-colors ${
          enabled ? "bg-thuy-400" : "bg-thuy-700"
        }`}
      >
        <span
          className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all ${
            enabled ? "left-4.5" : "left-0.5"
          }`}
        />
      </span>
    </button>
  );
}

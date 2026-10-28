"use client";

import React, { useEffect, useState } from "react";
import {
  GitBranch,
  RefreshCw,
  Loader2,
  CheckCircle2,
  AlertTriangle,
  FileCode2,
  Terminal,
  Info,
} from "lucide-react";
import CmsSyncButton, {
  syncCmsToGithub,
} from "@/components/admin/CmsSyncButton";

interface SyncFile {
  path: string;
  size: number;
}

interface LastSync {
  sha: string;
  at: string;
  url: string;
}

export default function AdminSyncPage() {
  const [loading, setLoading] = useState(true);
  const [files, setFiles] = useState<SyncFile[]>([]);
  const [lastSync, setLastSync] = useState<LastSync | null>(null);
  const [github, setGithub] = useState<{
    configured: boolean;
    repo: string;
    branch: string;
  } | null>(null);
  const [error, setError] = useState("");
  const [autoSync, setAutoSync] = useState(true);
  const [toggling, setToggling] = useState(false);

  const loadStatus = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/cms/sync");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Không tải được trạng thái.");
      setFiles(data.files || []);
      setGithub(data.github || null);
      setLastSync(data.lastSync || null);
      if (typeof data.autoSync === "boolean") setAutoSync(data.autoSync);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Không tải được trạng thái đồng bộ."
      );
    } finally {
      setLoading(false);
    }
  };

  const toggleAutoSync = async () => {
    const next = !autoSync;
    setToggling(true);
    try {
      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          settings: { cmsAutoSync: next ? "true" : "false" },
        }),
      });
      if (!res.ok) throw new Error("Không đổi được cài đặt.");
      setAutoSync(next);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không đổi được cài đặt.");
    } finally {
      setToggling(false);
    }
  };

  useEffect(() => {
    loadStatus();
  }, []);

  const totalSize = files.reduce((sum, file) => sum + file.size, 0);

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="p-6 rounded-2xl bg-thuy-850 border border-thuy-750 space-y-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="font-semibold text-sm text-[#142338] flex items-center gap-2">
              <GitBranch className="w-4 h-4 text-thuy-400" />
              Đồng Bộ Mã Nguồn (CMS → GitHub → Vercel)
            </h2>
            <p className="text-xs text-slate-600 mt-1.5">
              Mỗi lần bạn thay đổi nội dung trong CMS, bấm nút bên dưới (hoặc bật tự
              động đồng bộ) để ghi nội dung ra thư mục <code className="text-thuy-300">content/</code>{" "}
              trong mã nguồn, push lên GitHub. Vercel tự động deploy lại từ nhánh{" "}
              <code className="text-thuy-300">{github?.branch || "main"}</code>.
            </p>
          </div>
          <CmsSyncButton label="Đồng bộ ngay" />
        </div>

        <div className="pt-1 flex items-center gap-3">
          <button
            type="button"
            onClick={toggleAutoSync}
            disabled={toggling}
            className="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-thuy-900 border border-thuy-700 hover:border-thuy-400 transition-colors disabled:opacity-60"
          >
            <RefreshCw
              className={`w-3.5 h-3.5 ${
                autoSync ? "text-thuy-400" : "text-slate-500"
              }`}
            />
            <span className="text-xs text-slate-700">
              Tự động đồng bộ mã nguồn sau mỗi lần lưu trong CMS
            </span>
            <span
              className={`ml-1 w-9 h-5 rounded-full relative transition-colors ${
                autoSync ? "bg-thuy-400" : "bg-thuy-700"
              }`}
            >
              <span
                className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all ${
                  autoSync ? "left-4.5" : "left-0.5"
                }`}
              />
            </span>
          </button>
          {toggling && (
            <Loader2 className="w-3.5 h-3.5 animate-spin text-thuy-400" />
          )}
        </div>
      </div>

      {loading ? (
        <div className="p-8 rounded-2xl bg-thuy-850 border border-thuy-750 flex items-center justify-center gap-2 text-slate-600 text-xs">
          <Loader2 className="w-4 h-4 animate-spin text-thuy-400" />
          Đang kiểm tra cấu hình...
        </div>
      ) : error ? (
        <div className="p-6 rounded-2xl bg-thuy-850 border border-red-900/50 flex items-start gap-2 text-red-300 text-xs">
          <AlertTriangle className="w-4 h-4 flex-shrink-0" />
          {error}
        </div>
      ) : (
        <>
          <div className="p-6 rounded-2xl bg-thuy-850 border border-thuy-750 space-y-4">
            <h3 className="font-semibold text-sm text-[#142338]">Kết nối GitHub</h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3.5 rounded-xl bg-thuy-900 border border-thuy-750">
                <p className="text-[10px] uppercase tracking-wider text-slate-500 mb-1">
                  Repository
                </p>
                <p className="text-xs text-[#142338] font-semibold break-all">
                  {github?.repo || "-"}
                </p>
              </div>
              <div className="p-3.5 rounded-xl bg-thuy-900 border border-thuy-750">
                <p className="text-[10px] uppercase tracking-wider text-slate-500 mb-1">
                  Nhánh deploy
                </p>
                <p className="text-xs text-[#142338] font-semibold">
                  {github?.branch || "main"}
                </p>
              </div>
              <div className="p-3.5 rounded-xl bg-thuy-900 border border-thuy-750">
                <p className="text-[10px] uppercase tracking-wider text-slate-500 mb-1">
                  Token
                </p>
                <p
                  className={`text-xs font-semibold flex items-center gap-1.5 ${
                    github?.configured ? "text-emerald-300" : "text-amber-300"
                  }`}
                >
                  {github?.configured ? (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5" /> Đã cấu hình
                    </>
                  ) : (
                    <>
                      <AlertTriangle className="w-3.5 h-3.5" /> Chưa cấu hình
                    </>
                  )}
                </p>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-thuy-900 border border-thuy-750 flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-[10px] uppercase tracking-wider text-slate-500 mb-1">
                  Lần đồng bộ gần nhất
                </p>
                {lastSync?.sha ? (
                  <p className="text-xs text-[#142338]">
                    <a
                      href={lastSync.url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-thuy-300 underline"
                    >
                      {lastSync.sha.slice(0, 7)}
                    </a>{" "}
                    <span className="text-slate-600">
                      ·{" "}
                      {new Date(lastSync.at).toLocaleString("vi-VN")}
                    </span>
                  </p>
                ) : (
                  <p className="text-xs text-slate-600">Chưa có lần đồng bộ nào.</p>
                )}
              </div>
              <button
                type="button"
                onClick={loadStatus}
                className="text-[11px] text-slate-600 hover:text-[#142338] flex items-center gap-1.5"
              >
                <RefreshCw className="w-3 h-3" /> Làm mới
              </button>
            </div>

            {!github?.configured && (
              <div className="p-4 rounded-xl bg-amber-950/20 border border-amber-800/40 flex items-start gap-2">
                <Info className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                <div className="text-xs text-amber-200 space-y-1">
                  <p>
                    Thiếu secret <code className="text-thuy-300">GITHUB_TOKEN</code> trên
                    Vercel. Thêm token có quyền <b>Contents: Read &amp; write</b> cho repo{" "}
                    {github?.repo} để nút đồng bộ hoạt động.
                  </p>
                  <p className="text-amber-300/70">
                    Trong lúc chưa có token, bạn vẫn có thể kéo source về máy bằng lệnh{" "}
                    <code className="text-thuy-300">npm run cms:sync</code> rồi commit thủ công.
                  </p>
                </div>
              </div>
            )}
          </div>

          <div className="p-6 rounded-2xl bg-thuy-850 border border-thuy-750 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-sm text-[#142338] flex items-center gap-2">
                <FileCode2 className="w-4 h-4 text-thuy-400" />
                File sẽ được ghi vào mã nguồn
              </h3>
              <button
                type="button"
                onClick={loadStatus}
                className="text-[11px] text-slate-600 hover:text-[#142338] flex items-center gap-1.5"
              >
                <RefreshCw className="w-3 h-3" /> Làm mới
              </button>
            </div>

            <div className="divide-y divide-thuy-750 rounded-xl border border-thuy-750 overflow-hidden">
              {files.map((file) => (
                <div
                  key={file.path}
                  className="flex items-center justify-between px-4 py-2.5 bg-thuy-900 text-xs"
                >
                  <code className="text-thuy-300">{file.path}</code>
                  <span className="text-slate-500">
                    {(file.size / 1024).toFixed(1)} KB
                  </span>
                </div>
              ))}
            </div>

            <p className="text-[11px] text-slate-500">
              Tổng {files.length} file · {(totalSize / 1024).toFixed(1)} KB. Không
              export tài khoản người dùng, đơn hàng, token tải file và khóa file
              sản phẩm (dữ liệu nhạy cảm).
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-thuy-850 border border-thuy-750 space-y-3">
            <h3 className="font-semibold text-sm text-[#142338] flex items-center gap-2">
              <Terminal className="w-4 h-4 text-thuy-400" />
              Đồng bộ trong VSCode
            </h3>
            <p className="text-xs text-slate-600">
              Khi mở thư mục này trong VSCode, task{" "}
              <b className="text-slate-200">A-C-D: Theo dõi đồng bộ CMS</b> tự chạy và
              kéo commit mới từ CMS về máy mỗi 30 giây — không cần thao tác tay.
            </p>
            <pre className="p-4 rounded-xl bg-thuy-950 border border-thuy-750 text-[11px] text-emerald-300 overflow-x-auto">
{`npm run cms:watch          # theo dõi + tự git pull (tương đương task VSCode)
npm run cms:sync          # kéo về + commit + push thủ công
npm run cms:sync -- --dry-run   # chỉ kéo về, không commit`}
            </pre>
          </div>
        </>
      )}
    </div>
  );
}

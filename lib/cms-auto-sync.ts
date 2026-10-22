import { buildCmsExport } from "./cms-export";
import {
  getGithubBranch,
  getGithubRepo,
  isGithubConfigured,
  pushFilesToGithub,
} from "./github";
import { getSettings, saveSettings } from "./settings";

export interface CmsAutoSyncResult {
  synced: boolean;
  skipped?: boolean;
  commitSha?: string;
  commitUrl?: string;
  reason?: string;
}

/**
 * Tự động ghi nội dung CMS ra mã nguồn rồi push lên GitHub sau mỗi lần thay
 * đổi nội dung trong trang quản trị. Vercel sẽ tự deploy lại từ commit đó.
 *
 * Bật/tắt bằng setting `cmsAutoSync` (mặc định bật).
 */
export async function triggerCmsAutoSync(
  reason: string
): Promise<CmsAutoSyncResult> {
  if (!isGithubConfigured()) {
    return { synced: false, reason: "Chưa cấu hình GITHUB_TOKEN." };
  }

  try {
    const settings = await getSettings();
    if ((settings.cmsAutoSync || "true") !== "true") {
      return { synced: false, reason: "Đã tắt tự động đồng bộ." };
    }

    const files = await buildCmsExport();
    const result = await pushFilesToGithub(
      files.map((file) => ({ path: file.path, content: file.content })),
      `content: ${reason}`
    );

    await saveSettings({
      cmsLastSyncSha: result.commitSha,
      cmsLastSyncAt: new Date().toISOString(),
    });

    return {
      synced: true,
      skipped: result.skipped,
      commitSha: result.commitSha,
      commitUrl: result.commitUrl,
    };
  } catch (error) {
    console.error("CMS auto sync error:", error);
    return {
      synced: false,
      reason:
        error instanceof Error ? error.message : "Không thể đồng bộ mã nguồn.",
    };
  }
}

export function describeAutoSyncTarget() {
  return {
    configured: isGithubConfigured(),
    repo: getGithubRepo(),
    branch: getGithubBranch(),
  };
}

import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { buildCmsExport } from "@/lib/cms-export";
import { getSettings, saveSettings } from "@/lib/settings";
import {
  getGithubBranch,
  getGithubRepo,
  isGithubConfigured,
  pushFilesToGithub,
} from "@/lib/github";

export const dynamic = "force-dynamic";

async function requireAdmin() {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") return null;
  return user;
}

/**
 * GET: xem trạng thái đồng bộ + nội dung sẽ được ghi ra source.
 */
export async function GET() {
  const user = await requireAdmin();
  if (!user) {
    return NextResponse.json(
      { error: "Chỉ tài khoản ADMIN được phép đồng bộ mã nguồn." },
      { status: 403 }
    );
  }

  try {
    const files = await buildCmsExport();
    const settings = await getSettings();

    return NextResponse.json({
      success: true,
      github: {
        configured: isGithubConfigured(),
        repo: getGithubRepo(),
        branch: getGithubBranch(),
      },
      lastSync: {
        sha: settings.cmsLastSyncSha || "",
        at: settings.cmsLastSyncAt || "",
        url: settings.cmsLastSyncSha
          ? `https://github.com/${getGithubRepo()}/commit/${settings.cmsLastSyncSha}`
          : "",
      },
      autoSync: (settings.cmsAutoSync || "true") === "true",
      files: files.map((file) => ({
        path: file.path,
        size: Buffer.byteLength(file.content, "utf8"),
      })),
    });
  } catch (error) {
    console.error("CMS sync preview error:", error);
    return NextResponse.json(
      { error: "Không thể tải nội dung CMS để đồng bộ." },
      { status: 500 }
    );
  }
}

/**
 * POST: ghi nội dung CMS ra source code và push lên GitHub.
 * Push vào nhánh production sẽ khiến Vercel deploy lại tự động.
 */
export async function POST(request: Request) {
  const user = await requireAdmin();
  if (!user) {
    return NextResponse.json(
      { error: "Chỉ tài khoản ADMIN được phép đồng bộ mã nguồn." },
      { status: 403 }
    );
  }

  if (!isGithubConfigured()) {
    return NextResponse.json(
      {
        error:
          "Chưa cấu hình GITHUB_TOKEN trên Vercel nên chưa thể push mã nguồn. " +
          "Hãy thêm secret GITHUB_TOKEN (repo KtsTrinh/acd-arc, quyền Contents: Read & write).",
      },
      { status: 503 }
    );
  }

  try {
    const files = await buildCmsExport();
    const message =
      request.headers.get("x-cms-commit-message")?.trim() ||
      `content: đồng bộ nội dung CMS (${new Date().toISOString()})`;

    const result = await pushFilesToGithub(
      files.map((file) => ({ path: file.path, content: file.content })),
      message
    );

    // Lưu thông tin lần đồng bộ gần nhất (nội bộ, không export ra source)
    await saveSettings({
      cmsLastSyncSha: result.commitSha,
      cmsLastSyncAt: new Date().toISOString(),
    });

    return NextResponse.json({
      success: true,
      ...result,
      message:
        "Đã đồng bộ mã nguồn lên GitHub. Vercel sẽ tự động deploy lại trong vài phút.",
    });
  } catch (error) {
    console.error("CMS sync error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Không thể đồng bộ mã nguồn lên GitHub.",
      },
      { status: 500 }
    );
  }
}

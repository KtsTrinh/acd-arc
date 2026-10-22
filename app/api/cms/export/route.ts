import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { buildCmsExport } from "@/lib/cms-export";

export const dynamic = "force-dynamic";

/**
 * Trả về toàn bộ nội dung CMS dưới dạng file JSON.
 * Dùng bởi:
 *  - script cục bộ `npm run cms:sync` (kéo source về VSCode)
 *  - GitHub Actions workflow (đồng bộ định kỳ không cần token trong app)
 *
 * Xác thực bằng cookie admin HOẶC header `x-cms-sync-secret`.
 */
export async function GET(request: Request) {
  const secret = process.env.CMS_SYNC_SECRET;
  const provided = request.headers.get("x-cms-sync-secret");

  let authorized = Boolean(secret && provided && provided === secret);

  if (!authorized) {
    const user = await getCurrentUser();
    authorized = Boolean(user && user.role === "ADMIN");
  }

  if (!authorized) {
    return NextResponse.json(
      { error: "Không được phép truy xuất nội dung CMS." },
      { status: 403 }
    );
  }

  try {
    const files = await buildCmsExport();
    const payload: Record<string, string> = {};
    for (const file of files) {
      payload[file.path] = file.content;
    }

    return NextResponse.json({
      success: true,
      generatedAt: new Date().toISOString(),
      files: payload,
    });
  } catch (error) {
    console.error("CMS export error:", error);
    return NextResponse.json(
      { error: "Không thể tạo bản export nội dung CMS." },
      { status: 500 }
    );
  }
}

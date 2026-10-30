import { NextResponse } from "next/server";
import { deleteMediaItem } from "@/lib/storage";
import { triggerCmsAutoSync } from "@/lib/cms-auto-sync";
import { getCurrentUser } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || (user.role !== "ADMIN" && user.role !== "SUPER_ADMIN")) {
      return NextResponse.json(
        { error: "Chỉ quản trị viên mới được thực hiện thao tác này." },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { ids } = body as { ids?: string[] };

    if (!Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ error: "Vui lòng chọn ít nhất một media để xóa." }, { status: 400 });
    }

    const results = [];
    for (const id of ids) {
      try {
        await deleteMediaItem(id);
        results.push({ id, success: true });
      } catch (e) {
        results.push({ id, success: false });
      }
    }

    await triggerCmsAutoSync("xóa nhiều media");
    return NextResponse.json({ success: true, results, count: results.filter((r) => r.success).length });
  } catch (error) {
    console.error("Bulk delete media error:", error);
    return NextResponse.json({ error: "Không thể xóa nhiều media." }, { status: 500 });
  }
}

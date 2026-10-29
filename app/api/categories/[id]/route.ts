import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { triggerCmsAutoSync } from "@/lib/cms-auto-sync";

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser();
    if (!user || ((user.role !== "ADMIN" && user.role !== "SUPER_ADMIN") && user.role !== "SUPER_ADMIN")) {
      return NextResponse.json(
        { error: "Chỉ quản trị viên mới được xoá danh mục." },
        { status: 403 }
      );
    }

    const { id } = params;
    await prisma.projectCategory.delete({ where: { id } });

    const sync = await triggerCmsAutoSync("xóa danh mục dự án");
    return NextResponse.json({ success: true, sync });
  } catch (error) {
    console.error("Error deleting category:", error);
    return NextResponse.json(
      { error: "Không thể xoá danh mục (danh mục còn dự án đang dùng?)." },
      { status: 500 }
    );
  }
}

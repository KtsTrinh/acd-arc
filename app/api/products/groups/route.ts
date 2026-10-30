import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const includeEmpty = searchParams.get("includeEmpty") === "1";

    const products = await prisma.product.findMany({
      where: { active: true },
      select: { productGroup: true },
    });

    const groups = Array.from(
      new Set(
        products
          .map((p) => p.productGroup)
          .filter((g): g is string => g !== null && g !== undefined),
      ),
    ).sort();

    if (!includeEmpty) {
      return NextResponse.json({ groups });
    }

    return NextResponse.json({ groups });
  } catch (error) {
    console.error("Error fetching product groups:", error);
    return NextResponse.json(
      { error: "Không thể lấy danh sách nhóm sản phẩm." },
      { status: 500 }
    );
  }
}

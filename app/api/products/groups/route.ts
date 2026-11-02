import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const includeEmpty = searchParams.get("includeEmpty") === "1";

    try {
      const products = await prisma.product.findMany({
        where: { active: true },
        select: { productCategory: true },
      });

      const groups = Array.from(
        new Set(
          products
            .map((p) => p.productCategory)
            .filter((g): g is string => g !== null && g !== undefined),
        ),
      ).sort();

      return NextResponse.json({ groups });
    } catch (dbErr) {
      console.error("Error fetching product groups (fallback):", dbErr);
      return NextResponse.json({ groups: [] }, { status: 200 });
    }
  } catch (error) {
    console.error("Error fetching product groups:", error);
    return NextResponse.json({ groups: [] }, { status: 200 });
  }
}

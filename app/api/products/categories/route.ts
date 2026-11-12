import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const group = searchParams.get("group");

    const where: any = {};
    if (group && group !== "ALL") {
      where.productGroup = group;
    }

    try {
      const products = await prisma.product.findMany({
        where,
        select: { productCategory: true },
      });

      const categories = Array.from(
        new Set(
          products
            .map((p) => p.productCategory)
            .filter((c): c is string => c !== null && c !== undefined),
        ),
      ).sort();

      return NextResponse.json({ categories });
    } catch (dbErr) {
      console.error("Error fetching product categories (fallback):", dbErr);
      return NextResponse.json({ categories: [] }, { status: 200 });
    }
  } catch (error) {
    console.error("Error fetching product categories:", error);
    return NextResponse.json({ categories: [] }, { status: 200 });
  }
}

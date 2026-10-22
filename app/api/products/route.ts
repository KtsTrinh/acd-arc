import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/utils";
import { triggerCmsAutoSync } from "@/lib/cms-auto-sync";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type");
    const search = searchParams.get("search");
    const featured = searchParams.get("featured");

    const where: any = { active: true };

    if (type && type !== "ALL") {
      where.type = type;
    }

    if (featured === "true") {
      where.featured = true;
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
        { fileFormat: { contains: search, mode: "insensitive" } },
      ];
    }

    const products = await prisma.product.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ products });
  } catch (error) {
    console.error("Error fetching products:", error);
    return NextResponse.json(
      { error: "Không thể lấy danh sách sản phẩm." },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      name,
      slug,
      description,
      price,
      comparePrice,
      type,
      fileFormat,
      fileSize,
      fileKey,
      thumbnail,
      active,
      featured,
    } = body;

    if (!name || price === undefined) {
      return NextResponse.json(
        { error: "Vui lòng nhập tên và giá sản phẩm." },
        { status: 400 }
      );
    }

    const finalSlug = slug ? slugify(slug) : slugify(name);

    const product = await prisma.product.create({
      data: {
        name,
        slug: finalSlug,
        description,
        price: parseFloat(price),
        comparePrice: comparePrice ? parseFloat(comparePrice) : null,
        type: type || "CAD",
        fileFormat,
        fileSize,
        fileKey,
        thumbnail,
        active: active !== undefined ? Boolean(active) : true,
        featured: Boolean(featured),
      },
    });

    const sync = await triggerCmsAutoSync(`thêm sản phẩm "${product.name}"`);
    return NextResponse.json({ success: true, product, sync });
  } catch (error) {
    console.error("Error creating product:", error);
    return NextResponse.json(
      { error: "Lỗi trong quá trình tạo sản phẩm." },
      { status: 500 }
    );
  }
}


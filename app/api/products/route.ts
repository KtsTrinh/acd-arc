import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/utils";
import { triggerCmsAutoSync } from "@/lib/cms-auto-sync";
import { getCurrentUser } from "@/lib/auth";
import {
  getTypesOfGroup,
  sanitizeProduct,
} from "@/lib/catalog";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type");
    const group = searchParams.get("group");
    const search = searchParams.get("search");
    const featured = searchParams.get("featured");
    const includeInactive = searchParams.get("includeInactive") === "1";

    const user = await getCurrentUser();
    const isAdmin = user?.role === "ADMIN";

    const where: any = {};

    // Chỉ quản trị viên được xem sản phẩm đang ẩn
    if (!isAdmin || !includeInactive) {
      where.active = true;
    }

    if (group && group !== "ALL") {
      const types = getTypesOfGroup(group);
      if (types.length > 0) {
        where.type = { in: types as any };
      }
    } else if (type && type !== "ALL") {
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
      include: {
        project: { select: { id: true, title: true, slug: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    // Khách chưa thanh toán không được thấy khoá file / link gốc
    const payload = isAdmin ? products : products.map(sanitizeProduct);

    return NextResponse.json({ products: payload });
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
    const user = await getCurrentUser();
    if (!user || (user.role !== "ADMIN" && user.role !== "SUPER_ADMIN")) {
      return NextResponse.json(
        { error: "Chỉ quản trị viên mới được tạo mục danh mục sản phẩm." },
        { status: 403 }
      );
    }

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
      fileName,
      thumbnail,
      active,
      featured,
      requiresPayment,
      downloadLinkUrl,
      downloadExpiresMinutes,
      projectId,
      galleryMediaIds,
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
        fileName: fileName || (fileKey ? fileKey.split("/").pop() : null),
        thumbnail,
        active: active !== undefined ? Boolean(active) : true,
        featured: Boolean(featured),
        requiresPayment: requiresPayment !== undefined ? Boolean(requiresPayment) : true,
        downloadLinkUrl: downloadLinkUrl || null,
        downloadExpiresMinutes: downloadExpiresMinutes
          ? parseInt(downloadExpiresMinutes, 10)
          : 5,
        projectId: projectId || null,
      },
    });

    // Attach initial gallery media if provided
    if (galleryMediaIds && Array.isArray(galleryMediaIds) && galleryMediaIds.length > 0) {
      await prisma.projectMedia.createMany({
        data: galleryMediaIds.map((mediaId: string, index: number) => ({
          productId: product.id,
          mediaId,
          sortOrder: index,
        })),
      });
    }

    const createdProduct = await prisma.product.findUnique({
      where: { id: product.id },
      include: {
        project: { select: { id: true, title: true, slug: true } },
        gallery: { include: { media: true }, orderBy: { sortOrder: "asc" } },
      },
    });

    const sync = await triggerCmsAutoSync(`thêm sản phẩm "${createdProduct?.name ?? ""}"`);
    return NextResponse.json({ success: true, product: createdProduct, sync });
  } catch (error) {
    console.error("Error creating product:", error);
    return NextResponse.json(
      { error: "Lỗi trong quá trình tạo sản phẩm." },
      { status: 500 }
    );
  }
}

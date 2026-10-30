import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/utils";
import { triggerCmsAutoSync } from "@/lib/cms-auto-sync";
import { getCurrentUser } from "@/lib/auth";
import { sanitizeProduct } from "@/lib/catalog";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const group = searchParams.get("group");
    const productGroup = searchParams.get("productGroup");
    const productCategory = searchParams.get("productCategory");
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

    if (productGroup && productGroup !== "ALL") {
      where.productGroup = productGroup;
    } else if (group && group !== "ALL") {
      where.productGroup = group;
    }

    if (productCategory && productCategory !== "ALL") {
      where.productCategory = productCategory;
    }

    if (featured === "true") {
      where.featured = true;
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
        { fileFormat: { contains: search, mode: "insensitive" } },
        { productGroup: { contains: search, mode: "insensitive" } },
        { productCategory: { contains: search, mode: "insensitive" } },
      ];
    }

    const products = await prisma.product.findMany({
      where,
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
        { error: "Chỉ quản trị viên mới được tạo sản phẩm." },
        { status: 403 }
      );
    }

    const body = await request.json();
    const {
      name,
      slug,
      description,
      shortDesc,
      price,
      discount,
      priceAfterDiscount,
      productGroup,
      productCategory,
      fileFormat,
      fileSize,
      fileKey,
      fileName,
      thumbnail,
      active,
      featured,
      downloadLinkUrl,
      downloadExpiresMinutes,
      location,
      client,
      year,
      landArea,
      buildingArea,
      style,
      tagIds,
      galleryMediaIds,
    } = body;

    if (!name) {
      return NextResponse.json(
        { error: "Vui lòng nhập tên sản phẩm." },
        { status: 400 }
      );
    }

    const finalSlug = slug ? slugify(slug) : slugify(name);

    // Đảm bảo slug duy nhất
    let uniqueSlug = finalSlug;
    let counter = 1;
    while (await prisma.product.findUnique({ where: { slug: uniqueSlug } })) {
      uniqueSlug = `${finalSlug}-${counter}`;
      counter += 1;
    }

    const product = await prisma.product.create({
      data: {
        name,
        slug: uniqueSlug,
        description,
        shortDesc: shortDesc || null,
        price: price ? parseFloat(price) : null,
        discount: discount ? parseFloat(discount) : null,
        priceAfterDiscount: priceAfterDiscount
          ? parseFloat(priceAfterDiscount)
          : null,
        productGroup: productGroup || null,
        productCategory: productCategory || null,
        fileFormat,
        fileSize,
        fileKey,
        fileName: fileName || (fileKey ? fileKey.split("/").pop() : null),
        thumbnail,
        active: active !== undefined ? Boolean(active) : true,
        featured: Boolean(featured),
        downloadLinkUrl: downloadLinkUrl || null,
        downloadExpiresMinutes: downloadExpiresMinutes
          ? parseInt(downloadExpiresMinutes, 10)
          : 5,
        location: location || null,
        client: client || null,
        year: year ? parseInt(year, 10) : null,
        landArea: landArea ? parseFloat(landArea) : null,
        buildingArea: buildingArea ? parseFloat(buildingArea) : null,
        style: style || null,
      },
    });

    // Attach tags if provided
    if (tagIds && Array.isArray(tagIds) && tagIds.length > 0) {
      await prisma.productTag.createMany({
        data: tagIds.map((tagId: string) => ({
          productId: product.id,
          tagId,
        })),
      });
    }

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
        gallery: { include: { media: true }, orderBy: { sortOrder: "asc" } },
        tags: { include: { tag: true } },
      },
    });

    const sync = await triggerCmsAutoSync(`thêm sản phẩm "${createdProduct?.name ?? ""}"`);
    return NextResponse.json({ success: true, product: createdProduct, sync });
  } catch (error: any) {
    console.error("Error creating product:", error);
    const message = error?.message || "Lỗi trong quá trình tạo sản phẩm.";
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}

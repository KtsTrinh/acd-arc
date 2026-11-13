import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/utils";
import { triggerCmsAutoSync } from "@/lib/cms-auto-sync";
import { getCurrentUser } from "@/lib/auth";
import { sanitizeProduct } from "@/lib/catalog";
import { registerExternalMedia } from "@/lib/storage";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const user = await getCurrentUser();
    const isAdmin = user?.role === "ADMIN";

    const product = await prisma.product.findFirst({
      where: {
        OR: [{ id }, { slug: id }],
      },
      include: {
        gallery: { include: { media: true }, orderBy: { sortOrder: "asc" } },
        tags: { include: { tag: true } },
      },
    });

    if (!product) {
      return NextResponse.json(
        { error: "Không tìm thấy sản phẩm." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      product: isAdmin ? product : sanitizeProduct(product),
    });
  } catch (error) {
    console.error("Error fetching product:", error);
    return NextResponse.json(
      { error: "Lỗi truy vấn sản phẩm." },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser();
    if (!user || (user.role !== "ADMIN" && user.role !== "SUPER_ADMIN")) {
      return NextResponse.json(
        { error: "Chỉ quản trị viên mới được cập nhật sản phẩm." },
        { status: 403 }
      );
    }

    const { id } = params;
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
      floors,
      basementFloors,
      totalFloorArea,
      style,
      tagIds,
      galleryMediaIds,
    } = body;

    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (slug !== undefined) updateData.slug = slugify(slug);
    if (description !== undefined) updateData.description = description;
    if (shortDesc !== undefined) updateData.shortDesc = shortDesc || null;
    if (price !== undefined) updateData.price = price ? parseFloat(price) : null;
    if (discount !== undefined)
      updateData.discount = discount != null && discount !== "" ? parseFloat(discount) : null;
    if (priceAfterDiscount !== undefined)
      updateData.priceAfterDiscount =
        priceAfterDiscount != null && priceAfterDiscount !== ""
          ? parseFloat(priceAfterDiscount)
          : null;
    if (productGroup !== undefined) updateData.productGroup = productGroup || null;
    if (productCategory !== undefined)
      updateData.productCategory = productCategory || null;
    if (fileFormat !== undefined) updateData.fileFormat = fileFormat;
    if (fileSize !== undefined) updateData.fileSize = fileSize;
    if (fileKey !== undefined) updateData.fileKey = fileKey;
    if (fileName !== undefined) updateData.fileName = fileName;
    if (thumbnail !== undefined) updateData.thumbnail = thumbnail;
    if (active !== undefined) updateData.active = Boolean(active);
    if (featured !== undefined) updateData.featured = Boolean(featured);
    if (downloadLinkUrl !== undefined) updateData.downloadLinkUrl = downloadLinkUrl || null;
    if (downloadExpiresMinutes !== undefined)
      updateData.downloadExpiresMinutes = parseInt(downloadExpiresMinutes, 10) || 5;
    if (location !== undefined) updateData.location = location || null;
    if (client !== undefined) updateData.client = client || null;
    if (year !== undefined) updateData.year = year ? parseInt(year, 10) : null;
    if (landArea !== undefined) updateData.landArea = landArea ? parseFloat(landArea) : null;
    if (buildingArea !== undefined)
      updateData.buildingArea = buildingArea ? parseFloat(buildingArea) : null;
    if (floors !== undefined) updateData.floors = floors ? parseInt(floors, 10) : null;
    if (basementFloors !== undefined)
      updateData.basementFloors = basementFloors ? parseInt(basementFloors, 10) : null;
    if (totalFloorArea !== undefined)
      updateData.totalFloorArea = totalFloorArea ? parseFloat(totalFloorArea) : null;
    if (style !== undefined) updateData.style = style || null;

    const updated = await prisma.product.update({
      where: { id },
      data: updateData,
    });

    if (thumbnail && /^https?:\/\//i.test(thumbnail)) {
      await registerExternalMedia(thumbnail);
    }

    // Replace tags if provided
    if (tagIds && Array.isArray(tagIds)) {
      await prisma.productTag.deleteMany({ where: { productId: id } });
      await prisma.productTag.createMany({
        data: tagIds.map((tagId: string) => ({
          productId: id,
          tagId,
        })),
      });
    }

    // Replace gallery media if provided
    if (galleryMediaIds && Array.isArray(galleryMediaIds)) {
      await prisma.projectMedia.deleteMany({ where: { productId: id } });
      await prisma.projectMedia.createMany({
        data: galleryMediaIds.map((mediaId: string, index: number) => ({
          productId: id,
          mediaId,
          sortOrder: index,
        })),
      });
    }

    const finalProduct = await prisma.product.findUnique({
      where: { id },
      include: {
        gallery: { include: { media: true }, orderBy: { sortOrder: "asc" } },
        tags: { include: { tag: true } },
      },
    });

    const sync = await triggerCmsAutoSync(`cập nhật sản phẩm "${finalProduct?.name ?? ""}"`);
    return NextResponse.json({ success: true, product: finalProduct, sync });
  } catch (error: any) {
    console.error("Error updating product:", error);
    const message = error?.message || "Không thể cập nhật sản phẩm.";
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser();
    if (!user || (user.role !== "ADMIN" && user.role !== "SUPER_ADMIN")) {
      return NextResponse.json(
        { error: "Chỉ quản trị viên mới được xoá sản phẩm." },
        { status: 403 }
      );
    }

    const { id } = params;

    // Xóa các bản ghi liên quan trước khi xoá sản phẩm (tránh ràng buộc khóa ngoại)
    await prisma.orderItem.deleteMany({ where: { productId: id } });
    await prisma.downloadLink.deleteMany({ where: { productId: id } });
    await prisma.productTag.deleteMany({ where: { productId: id } });
    await prisma.projectMedia.deleteMany({ where: { productId: id } });

    await prisma.product.delete({ where: { id } });
    const sync = await triggerCmsAutoSync("xóa sản phẩm");
    return NextResponse.json({
      success: true,
      message: "Đã xóa sản phẩm thành công.",
      sync,
    });
  } catch (error) {
    console.error("Error deleting product:", error);
    return NextResponse.json(
      { error: "Không thể xóa sản phẩm." },
      { status: 500 }
    );
  }
}

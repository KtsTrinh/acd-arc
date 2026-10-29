import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/utils";
import { triggerCmsAutoSync } from "@/lib/cms-auto-sync";
import { getCurrentUser } from "@/lib/auth";
import { sanitizeProduct } from "@/lib/catalog";

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
        project: { select: { id: true, title: true, slug: true } },
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
    if (!user || (user.role === "ADMIN" || user.role === "SUPER_ADMIN")) {
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
    } = body;

    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (slug !== undefined) updateData.slug = slugify(slug);
    if (description !== undefined) updateData.description = description;
    if (price !== undefined) updateData.price = parseFloat(price);
    if (comparePrice !== undefined) updateData.comparePrice = comparePrice ? parseFloat(comparePrice) : null;
    if (type !== undefined) updateData.type = type;
    if (fileFormat !== undefined) updateData.fileFormat = fileFormat;
    if (fileSize !== undefined) updateData.fileSize = fileSize;
    if (fileKey !== undefined) updateData.fileKey = fileKey;
    if (fileName !== undefined) updateData.fileName = fileName;
    if (thumbnail !== undefined) updateData.thumbnail = thumbnail;
    if (active !== undefined) updateData.active = Boolean(active);
    if (featured !== undefined) updateData.featured = Boolean(featured);
    if (requiresPayment !== undefined) updateData.requiresPayment = Boolean(requiresPayment);
    if (downloadLinkUrl !== undefined) updateData.downloadLinkUrl = downloadLinkUrl || null;
    if (downloadExpiresMinutes !== undefined)
      updateData.downloadExpiresMinutes = parseInt(downloadExpiresMinutes, 10) || 5;
    if (projectId !== undefined) updateData.projectId = projectId || null;

    const updated = await prisma.product.update({
      where: { id },
      data: updateData,
    });

    const sync = await triggerCmsAutoSync(`cập nhật sản phẩm "${updated.name}"`);
    return NextResponse.json({ success: true, product: updated, sync });
  } catch (error) {
    console.error("Error updating product:", error);
    return NextResponse.json(
      { error: "Không thể cập nhật sản phẩm." },
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
    if (!user || (user.role === "ADMIN" || user.role === "SUPER_ADMIN")) {
      return NextResponse.json(
        { error: "Chỉ quản trị viên mới được xoá sản phẩm." },
        { status: 403 }
      );
    }

    const { id } = params;
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

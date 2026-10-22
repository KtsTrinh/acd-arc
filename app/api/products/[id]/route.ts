import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/utils";
import { triggerCmsAutoSync } from "@/lib/cms-auto-sync";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    const product = await prisma.product.findFirst({
      where: {
        OR: [{ id }, { slug: id }],
      },
    });

    if (!product) {
      return NextResponse.json(
        { error: "Không tìm thấy sản phẩm." },
        { status: 404 }
      );
    }

    return NextResponse.json({ product });
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
      thumbnail,
      active,
      featured,
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
    if (thumbnail !== undefined) updateData.thumbnail = thumbnail;
    if (active !== undefined) updateData.active = Boolean(active);
    if (featured !== undefined) updateData.featured = Boolean(featured);

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

